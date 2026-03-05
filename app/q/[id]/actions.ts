'use server'

import { createClient } from "@/utils/supabase/server";

export async function getPublicQuiz(quizId: string) {
  const supabase = await createClient();

  // 1. Fetch the quiz details
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, description, time_limit_seconds, require_password, quiz_password, shuffle_questions, is_published, intro_fields, show_results, start_time, end_time')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz || !quiz.is_published) {
    return { error: "Quiz not found or not currently active." };
  }

  // --- NEW: SERVER SIDE TIME VALIDATION ---
  const now = new Date();

  // Check if it hasn't started yet
  if (quiz.start_time && now < new Date(quiz.start_time)) {
    const startDate = new Date(quiz.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return { error: `This quiz hasn't started yet. It will be available beginning on ${startDate}.` };
  }

  // Check if it has already ended
  if (quiz.end_time && now > new Date(quiz.end_time)) {
    const endDate = new Date(quiz.end_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return { error: `This quiz has already ended. It closed on ${endDate} and is no longer accepting responses.` };
  }

  // 2. Fetch Questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, points')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true });

  if (!questions) return { error: "No questions found." };

  // 3. Fetch Options (CRITICAL: Do NOT select 'is_correct' here to prevent DevTools cheating)
  const { data: options } = await supabase
    .from('options')
    .select('id, question_id, option_text')
    .in('question_id', questions.map(q => q.id));

  // Map options to questions
  const formattedQuestions = questions.map(q => ({
    ...q,
    options: options?.filter(o => o.question_id === q.id) || []
  }));

  // Shuffle questions if enabled
  if (quiz.shuffle_questions) {
    formattedQuestions.sort(() => Math.random() - 0.5);
  }

  // Remove the actual password from the payload so it isn't exposed in the network tab
  const secureQuizConfig = {
    ...quiz,
    quiz_password: quiz.require_password ? "PROTECTED" : null,
  };

  return { quiz: secureQuizConfig, questions: formattedQuestions };
}

export async function submitQuizAndGrade(
  quizId: string,
  respondentName: string,
  userAnswers: Record<string, string>,
  warnings: number,
  respondentDetails: Record<string, string>, // <-- NEW: Catch the dynamic intro answers
  timeTakenSeconds: number
) {
  const supabase = await createClient();

  // 1. Fetch the REAL options to grade the test securely on the server
  const { data: realOptions } = await supabase
    .from('options')
    .select('id, question_id, is_correct')
    .in('question_id', Object.keys(userAnswers));

  const { data: questions } = await supabase
    .from('questions')
    .select('id, points')
    .eq('quiz_id', quizId);

  if (!realOptions || !questions) return { error: "Failed to grade quiz." };

  let score = 0;
  let totalPoints = 0;

  // 2. Calculate Score
  questions.forEach(q => {
    totalPoints += q.points;
    const selectedOptionId = userAnswers[q.id];
    const realOption = realOptions.find(o => o.id === selectedOptionId);

    if (realOption && realOption.is_correct) {
      score += q.points;
    }
  });

  // 3. Save to Database
  const { error } = await supabase
    .from('quiz_submissions')
    .insert({
      quiz_id: quizId,
      respondent_name: respondentName, // A fallback name we will extract on the client
      score: score,
      total_points: totalPoints,
      answers: userAnswers,
      cheat_warnings: warnings,
      respondent_details: respondentDetails, // <-- NEW: Saves the raw dynamic JSON data
      time_taken_seconds: timeTakenSeconds
    });

  if (error) {
    console.error("Submission Error:", error);
    return { error: "Failed to save submission." };
  }

  return { success: true, score, totalPoints };
}

export async function verifyQuizPassword(quizId: string, passwordAttempt: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('quizzes')
    .select('quiz_password')
    .eq('id', quizId)
    .single();

  if (!data) return false;

  return data.quiz_password === passwordAttempt;
}