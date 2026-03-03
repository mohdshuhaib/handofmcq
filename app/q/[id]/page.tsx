import { getPublicQuiz } from "./actions";
import QuizEngine from "./components/QuizEngine";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string | string[] }>;
}) {
  // Await the params object properly for modern Next.js
  const resolvedParams = await params;

  // Ensure the id is a flat string
  const quizId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

  const { quiz, questions, error } = await getPublicQuiz(quizId);

  if (error || !quiz || !questions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Quiz Unavailable</h1>
          <p className="text-slate-600">{error || "This quiz does not exist or has been closed."}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-blue-200">
      <QuizEngine quiz={quiz} questions={questions} />
    </main>
  );
}