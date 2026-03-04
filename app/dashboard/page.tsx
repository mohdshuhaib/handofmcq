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
  CheckCircle2,
  MoreVertical
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

  // 4. Fetch all Submissions (RLS automatically filters this)
  const { data: submissions } = await supabase
    .from("quiz_submissions")
    .select("id, submitted_at");

  // --- Calculate Analytics ---
  const totalQuizzes = quizzes?.length || 0;
  const activeQuizzes = quizzes?.filter(q => q.is_published).length || 0;
  const totalRespondents = submissions?.length || 0;
  const recentQuizzes = quizzes?.slice(0, 4) || []; // Display up to 4 recent quizzes

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Greeting */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {firstName} 👋
        </h2>
        <p className="mt-2 text-slate-500 font-medium">
          Here is what is happening with your tests today.
        </p>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-slate-200/50 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Quizzes</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{totalQuizzes}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-slate-200/50 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50 text-green-600 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Active / Published</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{activeQuizzes}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-slate-200/50 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Respondents</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{totalRespondents}</p>
          </div>
        </div>
      </div>

      {/* --- TWO COLUMN LAYOUT --- */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Recent Quizzes */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recent Quizzes</h3>
            <Link href="/dashboard/quizzes" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
            {recentQuizzes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentQuizzes.map(quiz => {
                  const date = new Date(quiz.created_at);
                  return (
                    <div key={quiz.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/quizzes/${quiz.id}/edit`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate text-lg">
                          {quiz.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                          quiz.is_published
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {quiz.is_published && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                          {quiz.is_published ? "Active" : "Draft"}
                        </span>

                        <Link href={`/dashboard/quizzes/${quiz.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all sm:opacity-0 sm:group-hover:opacity-100">
                          <MoreVertical className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">No quizzes yet</h4>
                <p className="text-slate-500 mb-6 max-w-sm">You haven't created any quizzes. Start by creating your first test to gather responses.</p>
                <Link href="/dashboard/quizzes/new" className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                  Create First Quiz
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-5 mt-6 lg:mt-0">
          <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>

          <div className="grid gap-4">
            <Link
              href="/dashboard/quizzes/new"
              className="group relative overflow-hidden bg-slate-900 rounded-2xl p-6 flex flex-col items-start gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-800"
            >
              {/* Decorative gradient blob */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500" />

              <div className="relative w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                <Plus className="w-6 h-6" />
              </div>
              <div className="relative">
                <h4 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">Create New Quiz</h4>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">Start from scratch, use AI, or upload an Excel file directly.</p>
              </div>
            </Link>

            <Link
              href="/dashboard/results"
              className="group bg-white border border-slate-300 rounded-2xl p-6 flex flex-col items-start gap-5 hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-lg group-hover:text-blue-600 transition-colors">Analyze Results</h4>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">Check grades, review cheating warnings, and export data easily.</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}