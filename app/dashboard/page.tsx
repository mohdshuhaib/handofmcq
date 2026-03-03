import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Users,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch User
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  // 2. Fetch Profile for Greeting
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(' ')[0] || "User";

  // 3. Fetch all Quizzes for stats
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, is_published, created_at")
    .order("created_at", { ascending: false });

  // 4. Fetch all Submissions (RLS automatically filters this to only show submissions for THIS user's quizzes)
  const { data: submissions } = await supabase
    .from("quiz_submissions")
    .select("id, submitted_at");

  // --- Calculate Analytics ---
  const totalQuizzes = quizzes?.length || 0;
  const activeQuizzes = quizzes?.filter(q => q.is_published).length || 0;
  const totalRespondents = submissions?.length || 0;
  const recentQuizzes = quizzes?.slice(0, 3) || []; // Get the 3 newest quizzes

  return (
    <main className="pb-12">

      {/* Header Greeting */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Welcome back, {firstName} 👋</h2>
        <p className="mt-2 text-slate-600">Here is what is happening with your tests today.</p>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Quizzes</p>
            <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-green-600 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active (Published)</p>
            <p className="text-2xl font-bold text-slate-900">{activeQuizzes}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Respondents</p>
            <p className="text-2xl font-bold text-slate-900">{totalRespondents}</p>
          </div>
        </div>
      </div>

      {/* --- TWO COLUMN LAYOUT --- */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Recent Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recent Quizzes</h3>
            <Link href="/dashboard/quizzes" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {recentQuizzes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentQuizzes.map(quiz => {
                  const date = new Date(quiz.created_at);
                  return (
                    <div key={quiz.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <Link href={`/dashboard/quizzes/${quiz.id}/edit`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                          {quiz.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {date.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        quiz.is_published
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {quiz.is_published ? "Active" : "Draft"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-slate-500">You haven't created any quizzes yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>

          <div className="grid gap-4">
            <Link
              href="/dashboard/quizzes/new"
              className="group bg-slate-900 rounded-2xl p-5 flex flex-col items-start gap-4 hover:bg-slate-800 transition-all shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold">Create New Quiz</h4>
                <p className="text-slate-400 text-sm mt-1">Start from scratch or upload an Excel file.</p>
              </div>
            </Link>

            <Link
              href="/dashboard/results"
              className="group bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-start gap-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">Analyze Results</h4>
                <p className="text-slate-500 text-sm mt-1">Check grades, cheating warnings, and export data.</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}