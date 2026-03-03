import Link from 'next/link';
import { ArrowLeft, AlertCircle, UserPlus } from 'lucide-react';
import { signup } from '../auth/actions';

export default async function SignUpPage({
  searchParams,
}: {
  // In modern Next.js, searchParams is a Promise
  searchParams: Promise<{ message?: string }>
}) {
  // Await the params to fix the Next.js Sync Dynamic APIs error
  const resolvedParams = await searchParams;
  const message = resolvedParams?.message;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 p-6 selection:bg-slate-200 selection:text-slate-900">

      {/* Background Decoration (Subtle Grid) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* Back to Home Button */}
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-3 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Homepage
        </Link>

        {/* Signup Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <div className="p-8 sm:p-10">

            {/* Header */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-900/30">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Create an account
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Start creating proctored tests for free
              </p>
            </div>

            {/* Error Message Display */}
            {message && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-inset ring-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <p className="font-semibold">{message}</p>
              </div>
            )}

            {/* Signup Form */}
            <form className="space-y-5" action={signup}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 block w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm sm:leading-6 outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="mt-2 block w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-slate-900 sm:text-sm sm:leading-6 outline-none"
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:scale-[0.98] shadow-md shadow-slate-900/20"
                >
                  Create account securely
                </button>
              </div>
            </form>
          </div>

          {/* Footer Area */}
          <div className="bg-slate-50 px-8 py-6 text-center ring-1 ring-inset ring-slate-100 sm:px-10">
            <p className="text-sm font-medium text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-slate-900 transition-colors hover:text-slate-700 hover:underline underline-offset-4">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}