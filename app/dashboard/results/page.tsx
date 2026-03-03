import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Calendar, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResultsIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all quizzes created by this user
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, created_at, is_published")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quiz Results</h1>
        <p className="mt-2 text-slate-600">Select a quiz to view detailed analytics and respondent submissions.</p>
      </div>

      {/* Quizzes List */}
      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const date = new Date(quiz.created_at);
            return (
              <Link
                href={`/dashboard/results/${quiz.id}`}
                key={quiz.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${quiz.is_published ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                      quiz.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {quiz.is_published ? "Active" : "Draft"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-4">
                    <Calendar className="w-4 h-4" />
                    Created {date.toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-sm font-semibold text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                  View Analytics
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No results yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            You haven't created any quizzes yet. Once you create and publish a quiz, you can track its results here.
          </p>
          <Link
            href="/dashboard/quizzes/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700"
          >
            Create a Quiz
          </Link>
        </div>
      )}
    </div>
  );
}