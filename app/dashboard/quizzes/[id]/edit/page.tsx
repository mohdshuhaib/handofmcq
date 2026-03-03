import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditQuizClient from "./EditQuizClient";

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch Quiz Data
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", resolvedParams.id)
    .eq("creator_id", user.id)
    .single();

  if (quizError || !quiz) redirect("/dashboard/quizzes");

  // 2. Fetch Questions
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .order("sort_order", { ascending: true });

  // 3. Fetch Options for those questions
  const { data: options } = await supabase
    .from("options")
    .select("*")
    .in("question_id", questions?.map(q => q.id) || []);

  // 4. Format the data to match our Frontend Types perfectly (UPDATED FOR NEW FIELDS)
  const formattedQuizState = {
    title: quiz.title,
    description: quiz.description || "",
    time_limit_seconds: quiz.time_limit_seconds || null, // <-- Fixes the Timer
    require_password: quiz.require_password,
    quiz_password: quiz.quiz_password || "",
    shuffle_questions: quiz.shuffle_questions,
    is_published: quiz.is_published,
    intro_fields: quiz.intro_fields || [],               // <-- Fixes the Intro Form
    show_results: quiz.show_results !== undefined ? quiz.show_results : true, // <-- Fixes the Show Results toggle
  };

  const formattedQuestions = questions?.map(q => ({
    id: q.id,
    text: q.question_text,
    points: q.points,
    options: options?.filter(o => o.question_id === q.id).map(o => ({
      id: o.id,
      text: o.option_text,
      isCorrect: o.is_correct
    })) || []
  })) || [];

  return (
    <EditQuizClient
      quizId={quiz.id}
      initialQuizState={formattedQuizState}
      initialQuestions={formattedQuestions}
    />
  );
}