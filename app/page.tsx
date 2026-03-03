import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-3xl text-center space-y-8">

        {/* Hero Section */}
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          Hand of <span className="text-blue-600">MCQ</span>
        </h1>

        <p className="text-lg text-slate-600 sm:text-xl leading-relaxed">
          The modern, secure, and completely free platform to create, manage, and proctor multiple-choice tests.
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Log In to Get Started
          </Link>

          <Link href="/signup" className="text-sm font-semibold text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline">
            Create a free account
          </Link>
        </div>
      </div>
    </main>
  );
}