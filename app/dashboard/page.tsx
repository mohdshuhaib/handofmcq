import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch the currently logged-in user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <h2 className="text-3xl font-bold text-slate-900">Your Workspace</h2>
        <p className="mt-2 text-slate-600">Create and manage your proctored tests here.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Create Quiz Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer flex flex-col items-start justify-between h-48">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Create New Quiz</h3>
              <p className="mt-2 text-sm text-slate-500">Start from scratch or import from Google Forms.</p>
            </div>
            <button className="rounded-md bg-blue-50 text-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-100 transition-colors">
              + New Quiz
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}