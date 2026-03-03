import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResultsClient from "./components/ResultsClient";

export default async function QuizResultsPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch Quiz Details (and ensure they own it)
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, title, description")
    .eq("id", resolvedParams.id)
    .eq("creator_id", user.id)
    .single();

  if (quizError || !quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Quiz not found</h2>
        <p className="text-slate-600 mt-2">You do not have permission to view these results.</p>
        <Link href="/dashboard" className="text-blue-600 mt-4 inline-block hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // 2. Fetch all submissions for this quiz
  const { data: submissions } = await supabase
    .from("quiz_submissions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/quizzes" className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Results: {quiz.title}</h1>
          <p className="text-slate-600 text-sm mt-1">Analytics and respondent submissions.</p>
        </div>
      </div>

      {/* Render the Client Dashboard */}
      <ResultsClient quiz={quiz} submissions={submissions || []} />
    </div>
  );
}