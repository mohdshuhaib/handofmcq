"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { saveFullQuiz } from "../actions";
import { QuizState, Question } from "./types";

// Import our new components
import QuizSettings from "./components/QuizSettings";
import BulkUploadTools from "./components/BulkUploadTools";
import QuestionCard from "./components/QuestionCard";
import StickySaveBar from "./components/StickySaveBar";

export default function CreateQuizPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [quiz, setQuiz] = useState<QuizState>({
  title: "", description: "", time_limit_seconds: null, require_password: false, // <-- NEW
  quiz_password: "", shuffle_questions: false, is_published: false, intro_fields: []
});

  const [questions, setQuestions] = useState<Question[]>([{
    id: crypto.randomUUID(), text: "", points: 1,
    options: [
      { id: crypto.randomUUID(), text: "", isCorrect: true },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ],
  }]);

  const addManualQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(), text: "", points: 1,
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: true },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    }]);
  };

  const handleImport = (importedQuestions: Question[]) => {
    const isFirstQuestionBlank = questions.length === 1 && questions[0].text === "";
    setQuestions(isFirstQuestionBlank ? importedQuestions : [...questions, ...importedQuestions]);
  };

  const handleSave = async (isPublished: boolean) => {
    if (!quiz.title.trim()) {
      setErrorMsg("Quiz title is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSaving(true);
    setErrorMsg("");

    const result = await saveFullQuiz({ ...quiz, is_published: isPublished }, questions);

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
          <h1 className="text-3xl font-bold text-slate-900">Create New Quiz</h1>
          <p className="text-slate-600">Build your test questions and configure settings.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Modular Components */}
      <QuizSettings quiz={quiz} onChange={setQuiz} />

      <BulkUploadTools onImport={handleImport} onError={setErrorMsg} />

      <div className="space-y-6">
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
          <Plus className="w-5 h-5" /> Add Manual Question
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