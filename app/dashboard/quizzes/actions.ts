'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveFullQuiz(quizData: any, questionsData: any[]) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to create a quiz." };
  }

  try {
    // 1. Insert the Quiz
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        creator_id: user.id,
        title: quizData.title,
        description: quizData.description,
        time_limit: quizData.time_limit ? parseInt(quizData.time_limit) : null,
        require_password: quizData.require_password,
        quiz_password: quizData.quiz_password,
        shuffle_questions: quizData.shuffle_questions,
        is_published: quizData.is_published,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    // 2. Insert Questions and their Options
    // We use a loop here to ensure we get the generated question ID for the options
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];

      const { data: newQuestion, error: qError } = await supabase
        .from('questions')
        .insert({
          quiz_id: newQuiz.id,
          question_text: q.text,
          points: q.points,
          sort_order: i, // Maintains the order they built them in
        })
        .select()
        .single();

      if (qError) throw qError;

      // Map the frontend options to match the database schema
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
        time_limit: quizData.time_limit ? parseInt(quizData.time_limit) : null,
        require_password: quizData.require_password,
        quiz_password: quizData.quiz_password,
        shuffle_questions: quizData.shuffle_questions,
        is_published: quizData.is_published,
      })
      .eq('id', quizId)
      .eq('creator_id', user.id); // Security check

    if (quizError) throw quizError;

    // 2. Handle Deletions (Remove questions the user deleted from the UI)
    const currentQuestionIds = questionsData.map(q => q.id);
    if (currentQuestionIds.length > 0) {
      await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizId)
        .not('id', 'in', `(${currentQuestionIds.join(',')})`);
    }

    // 3. Upsert Questions and Options
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];

      // Upsert Question
      const { error: qError } = await supabase
        .from('questions')
        .upsert({
          id: q.id, // Using the existing ID to update, or a new UUID to insert
          quiz_id: quizId,
          question_text: q.text,
          points: q.points,
          sort_order: i,
        });

      if (qError) throw qError;

      // Extract current option IDs to delete removed options
      const currentOptionIds = q.options.map((opt: any) => opt.id);
      if (currentOptionIds.length > 0) {
         await supabase
          .from('options')
          .delete()
          .eq('question_id', q.id)
          .not('id', 'in', `(${currentOptionIds.join(',')})`);
      }

      // Upsert Options
      const optionsToUpsert = q.options.map((opt: any) => ({
        id: opt.id,
        question_id: q.id,
        option_text: opt.text,
        is_correct: opt.isCorrect,
      }));

      const { error: optError } = await supabase
        .from('options')
        .upsert(optionsToUpsert);

      if (optError) throw optError;
    }

    revalidatePath('/dashboard/quizzes');
    return { success: true };

  } catch (error: any) {
    console.error("Quiz update error:", error);
    return { error: error.message || "Failed to update quiz." };
  }
}