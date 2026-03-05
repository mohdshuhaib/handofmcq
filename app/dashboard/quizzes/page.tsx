import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, FileQuestion } from "lucide-react";
import QuizCard from "./components/QuizCard";

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch quizzes ordered by newest first
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Quizzes</h1>
          <p className="mt-2 text-slate-600">Manage your tests, view results, and share links.</p>
        </div>
        <Link
          href="/dashboard/quizzes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Quiz
        </Link>
      </div>

      {/* Quizzes Grid - USING THE NEW COMPONENT */}
      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-6 font-anek sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <FileQuestion className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No quizzes yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Get started by creating your first multiple-choice test. You can build it manually or import from an Excel file.
          </p>
          <Link
            href="/dashboard/quizzes/new"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
          >
            <Plus className="w-5 h-5" />
            Create Your First Quiz
          </Link>
        </div>
      )}
    </div>
  );
}