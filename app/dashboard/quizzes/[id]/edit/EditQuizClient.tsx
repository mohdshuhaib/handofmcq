"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { updateFullQuiz } from "../../actions";
import { QuizState, Question } from "../../new/types";

// Reuse our components from the 'new' folder!
import QuizSettings from "../../new/components/QuizSettings";
import QuestionCard from "../../new/components/QuestionCard";
import StickySaveBar from "../../new/components/StickySaveBar";

interface Props {
  quizId: string;
  initialQuizState: QuizState;
  initialQuestions: Question[];
}

export default function EditQuizClient({ quizId, initialQuizState, initialQuestions }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize state with the data fetched from the database
  const [quiz, setQuiz] = useState<QuizState>(initialQuizState);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const addManualQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      text: "",
      points: 1,
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: true },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    }]);
  };

  const handleSave = async (isPublished: boolean) => {
    if (!quiz.title.trim()) {
      setErrorMsg("Quiz title is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSaving(true);
    setErrorMsg("");

    const result = await updateFullQuiz(quizId, { ...quiz, is_published: isPublished }, questions);

    if (result.error) {
      setErrorMsg(result.error);
      setIsSaving(false);
    } else {
      router.push("/dashboard/quizzes");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/quizzes" className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Quiz</h1>
          <p className="text-slate-600">Update your test questions and configurations.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Modular Components - Loaded with existing data */}
      <QuizSettings quiz={quiz} onChange={setQuiz} />

      <div className="space-y-6 font-anek">
        {questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            canDelete={questions.length > 1}
            onChange={(updatedQ) => setQuestions(questions.map(old => old.id === q.id ? updatedQ : old))}
            onDelete={() => setQuestions(questions.filter(old => old.id !== q.id))}
          />
        ))}

        <button
          onClick={addManualQuestion}
          className="w-full py-4 border-2 border-dashed border-slate-300 bg-white rounded-2xl text-slate-500 font-semibold hover:border-slate-400 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Another Question
        </button>
      </div>

      <StickySaveBar
        questionCount={questions.length}
        isSaving={isSaving}
        onSave={handleSave}
      />

    </div>
  );
}