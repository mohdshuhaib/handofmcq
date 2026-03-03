import Link from 'next/link';
import { signup } from '../auth/actions';

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
          <p className="mt-2 text-sm text-slate-600">Start creating proctored tests for free</p>
        </div>

        {/* Error Message Display */}
        {searchParams?.message && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {searchParams.message}
          </div>
        )}

        <form className="space-y-6" action={signup}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
              placeholder="Create a strong password (min 6 chars)"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.98]"
          >
            Sign up
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-600">Already have an account? </span>
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}