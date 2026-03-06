import { getPublicQuiz } from "./actions";
import QuizEngine from "./components/QuizEngine";
import QuizStatus from "./components/QuizStatus";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string | string[] }>;
}) {
  // Await the params object properly for modern Next.js
  const resolvedParams = await params;

  // Ensure the id is a flat string
  const quizId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

  const { status, quiz, questions, startTime, endTime, quizTitle } = await getPublicQuiz(quizId);

  // If the status is not explicitly 'active', show our new interactive Status screen!
  if (status !== 'active') {
    return (
      <QuizStatus
        status={status as "unavailable" | "not_started" | "ended"}
        startTime={startTime}
        endTime={endTime}
        quizTitle={quizTitle}
      />
    );
  }

  // If active, render the Quiz Engine normally
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-blue-200">
      <QuizEngine quiz={quiz!} questions={questions!} />
    </main>
  );
}