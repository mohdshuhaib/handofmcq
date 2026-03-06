'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to safely convert local datetime to an ISO string for Supabase
const formatToISO = (dateStr: string | null) => {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString();
};

// --- 1. CREATE NEW QUIZ ---
export async function saveFullQuiz(quizData: any, questionsData: any[]) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to create a quiz." };
  }

  try {
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        creator_id: user.id,
        title: quizData.title,
        description: quizData.description,
        time_limit_seconds: quizData.time_limit_seconds,
        require_password: quizData.require_password,
        quiz_password: quizData.quiz_password,
        shuffle_questions: quizData.shuffle_questions,
        is_published: quizData.is_published,
        intro_fields: quizData.intro_fields || [],
        show_results: quizData.show_results !== undefined ? quizData.show_results : true,
        start_time: formatToISO(quizData.start_time),
        end_time: formatToISO(quizData.end_time)
      })
      .select()
      .single();

    if (quizError) throw quizError;

    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];

      const { data: newQuestion, error: qError } = await supabase
        .from('questions')
        .insert({
          quiz_id: newQuiz.id,
          question_text: q.text,
          points: q.points,
          sort_order: i,
        })
        .select()
        .single();

      if (qError) throw qError;

      const optionsToInsert = q.options.map((opt: any) => ({
        question_id: newQuestion.id,
        option_text: opt.text,
        is_correct: opt.isCorrect,
      }));

      const { error: optError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optError) throw optError;
    }

    revalidatePath('/dashboard/quizzes');
    return { success: true, quizId: newQuiz.id };

  } catch (error: any) {
    console.error("Quiz creation error:", error);
    return { error: error.message || "Failed to save quiz." };
  }
}

// --- 2. UPDATE EXISTING QUIZ (WITH STRICT AUTO-REGRADING) ---
export async function updateFullQuiz(quizId: string, quizData: any, questionsData: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  try {
    // 1. Update the Quiz Settings
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({
        title: quizData.title,
        description: quizData.description,
        time_limit_seconds: quizData.time_limit_seconds,
        require_password: quizData.require_password,
        quiz_password: quizData.quiz_password,
        shuffle_questions: quizData.shuffle_questions,
        is_published: quizData.is_published,
        intro_fields: quizData.intro_fields || [],
        show_results: quizData.show_results !== undefined ? quizData.show_results : true,
        start_time: formatToISO(quizData.start_time),
        end_time: formatToISO(quizData.end_time)
      })
      .eq('id', quizId)
      .eq('creator_id', user.id);

    if (quizError) throw quizError;

    // 2. Handle Deletions cleanly
    const currentQuestionIds = questionsData.map(q => q.id);
    if (currentQuestionIds.length > 0) {
      await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizId)
        .not('id', 'in', `(${currentQuestionIds.join(',')})`);
    }

    // 3. FORCE Upsert Questions and Options
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];

      // Use onConflict to strictly overwrite existing data!
      const { error: qError } = await supabase
        .from('questions')
        .upsert({
          id: q.id,
          quiz_id: quizId,
          question_text: q.text,
          points: q.points,
          sort_order: i,
        }, { onConflict: 'id' });

      if (qError) throw qError;

      const currentOptionIds = q.options.map((opt: any) => opt.id);
      if (currentOptionIds.length > 0) {
         await supabase
          .from('options')
          .delete()
          .eq('question_id', q.id)
          .not('id', 'in', `(${currentOptionIds.join(',')})`);
      }

      const optionsToUpsert = q.options.map((opt: any) => ({
        id: opt.id,
        question_id: q.id,
        option_text: opt.text,
        is_correct: opt.isCorrect,
      }));

      // Use onConflict to strictly overwrite the correct answers!
      const { error: optError } = await supabase
        .from('options')
        .upsert(optionsToUpsert, { onConflict: 'id' });

      if (optError) throw optError;
    }

    // --- 4. STRICT AUTO RE-GRADE ---
    const { data: submissions, error: subFetchErr } = await supabase
      .from('quiz_submissions')
      .select('id, answers')
      .eq('quiz_id', quizId);

    if (subFetchErr) console.error("Auto-Regrade fetch error:", subFetchErr);

    if (submissions && submissions.length > 0) {
      for (const sub of submissions) {
        let newScore = 0;
        let newTotalPoints = 0;

        // Regrade based on the fresh data from the UI
        questionsData.forEach((q: any) => {
          const pointValue = q.points || 1;
          newTotalPoints += pointValue;

          const selectedOptionId = sub.answers[q.id];
          const correctOption = q.options.find((o: any) => o.isCorrect === true);

          if (selectedOptionId && correctOption && selectedOptionId === correctOption.id) {
            newScore += pointValue;
          }
        });

        // Push corrected scores back to DB
        const { error: updateErr } = await supabase
          .from('quiz_submissions')
          .update({ score: newScore, total_points: newTotalPoints })
          .eq('id', sub.id);

        if (updateErr) console.error("Failed to update score for", sub.id, updateErr);
      }
    }

    // Force Next.js to aggressively clear its caches so UI updates instantly
    revalidatePath('/dashboard/quizzes');
    revalidatePath(`/dashboard/quizzes/${quizId}/edit`);
    revalidatePath(`/dashboard/results/${quizId}`);

    return { success: true };

  } catch (error: any) {
    console.error("Quiz update error:", error);
    return { error: error.message || "Failed to update quiz." };
  }
}

// --- 3. DELETE QUIZ ---
export async function deleteQuiz(quizId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  try {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
      .eq('creator_id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/quizzes');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { error: "Failed to delete quiz." };
  }
}

// --- 4. GET EXPORT DATA ---
export async function getQuizExportData(quizId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  try {
    const { data: quiz, error: quizErr } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('creator_id', user.id)
      .single();

    if (quizErr || !quiz) throw new Error("Quiz not found.");

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sort_order', { ascending: true });

    const { data: options } = await supabase
      .from('options')
      .select('*')
      .in('question_id', questions?.map(q => q.id) || []);

    const { data: submissions } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false });

    return { success: true, quiz, questions: questions || [], options: options || [], submissions: submissions || [] };
  } catch (error: any) {
    console.error("Export error:", error);
    return { error: "Failed to fetch export data." };
  }
}