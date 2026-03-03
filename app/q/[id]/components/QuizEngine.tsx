"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { submitQuizAndGrade } from "../actions";

interface Option { id: string; option_text: string; }
interface Question { id: string; question_text: string; points: number; options: Option[]; }
interface IntroField { id: string; label: string; type: string; required: boolean; options?: string[]; }
interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_seconds: number | null;
  require_password: boolean;
  intro_fields?: IntroField[];
}

export default function QuizEngine({ quiz, questions }: { quiz: Quiz, questions: Question[] }) {
  // --- STATE MANAGEMENT ---
  const [phase, setPhase] = useState<'gate' | 'intro' | 'active' | 'finished'>('gate');
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Test Data
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: optionId }

  // Timer is now directly in seconds from the database
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.time_limit_seconds || null);

  const [warnings, setWarnings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  // Dynamic Intro Form State
  const [introDetails, setIntroDetails] = useState<Record<string, string>>({});

  const MAX_WARNINGS = 3;

  // --- HELPER: Extract Name ---
  // Tries to find a field named "name" to use for the UI, otherwise uses a default
  const getDisplayName = useCallback(() => {
    // Check if we used the fallback field
    if (introDetails['default_name']) return introDetails['default_name'];

    // Otherwise look through dynamic fields
    const nameField = quiz.intro_fields?.find(f => f.label.toLowerCase().includes("name"));
    if (nameField && introDetails[nameField.id]) {
      return introDetails[nameField.id];
    }

    return "Respondent";
  }, [introDetails, quiz.intro_fields]);

  // --- SUBMISSION LOGIC ---
  const handleComplete = useCallback(async (forced: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Exit full screen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const respondentName = getDisplayName();

    // Pass introDetails (the JSON) as the 5th parameter
    const res = await submitQuizAndGrade(quiz.id, respondentName, answers, warnings, introDetails);

    if (res.success) {
      setResult({ score: res.score!, total: res.totalPoints! });
      setPhase('finished');
    } else {
      alert("Error submitting quiz. Please notify your instructor.");
    }
    setIsSubmitting(false);
  }, [answers, introDetails, isSubmitting, quiz.id, warnings, getDisplayName]);

  // --- PROCTORING EFFECTS ---
  useEffect(() => {
    if (phase !== 'active') return;

    // 1. Timer Logic
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete(true); // Auto-submit when time is up
    }

    // 2. Tab Switching Detection (Anti-Cheat)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_WARNINGS) {
             handleComplete(true); // Auto-terminate if they cheat too much
          } else {
             alert(`WARNING: You left the quiz tab. This is warning ${newCount} of ${MAX_WARNINGS}. Your test will be auto-submitted if you continue.`);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Disable Copy/Paste and Right Click
    const disableContext = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    document.addEventListener("copy", disableContext);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("copy", disableContext);
    };
  }, [phase, timeLeft, handleComplete]);

  // --- HANDLERS ---
  const startQuiz = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.log("Fullscreen denied or unsupported");
    }
    setPhase('active');
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('intro');
  };

  // --- RENDER HELPERS ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeText = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0 && s > 0) return `${m} minutes and ${s} seconds`;
    if (m > 0) return `${m} minutes`;
    return `${s} seconds`;
  };

  // 1. GATEWAY VIEW
  if (phase === 'gate') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h1>
          <p className="text-slate-600 mb-6 text-sm">{quiz.description}</p>

          {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{authError}</div>}

          <form onSubmit={handleGateSubmit} className="space-y-4">

            {/* Fallback if teacher forgot to add intro fields */}
            {(!quiz.intro_fields || quiz.intro_fields.length === 0) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={introDetails['default_name'] || ""}
                  onChange={e => setIntroDetails({...introDetails, 'default_name': e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                />
              </div>
            )}

            {/* Map through the dynamic fields created by the teacher */}
            {quiz.intro_fields?.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>

                {field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={introDetails[field.id] || ""}
                    onChange={e => setIntroDetails({...introDetails, [field.id]: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="" disabled>Select an option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    value={introDetails[field.id] || ""}
                    onChange={e => setIntroDetails({...introDetails, [field.id]: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                  />
                )}
              </div>
            ))}

            {quiz.require_password && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                />
              </div>
            )}

            <button type="submit" className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. INTRO / PROCTORING RULES VIEW
  if (phase === 'intro') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Proctored Examination Rules</h2>
          </div>

          <ul className="space-y-4 mb-8 text-slate-700">
            <li className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" /> <strong>Identity:</strong> You are taking this test as {getDisplayName()}.</li>
            <li className="flex gap-3"><Clock className="w-6 h-6 text-slate-500 shrink-0" /> <strong>Time Limit:</strong> {quiz.time_limit_seconds ? `${formatTimeText(quiz.time_limit_seconds)}. The test auto-submits when time expires.` : 'No time limit.'}</li>
            <li className="flex gap-3"><Lock className="w-6 h-6 text-slate-500 shrink-0" /> <strong>Fullscreen Required:</strong> Starting the test will put your browser in full screen mode.</li>
            <li className="flex gap-3"><AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" /> <strong>Anti-Cheat Active:</strong> Switching tabs, opening other apps, or copying text will be recorded. You have {MAX_WARNINGS} warnings before instant termination.</li>
          </ul>

          <button onClick={startQuiz} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-lg">
            I Agree, Start Test
          </button>
        </div>
      </div>
    );
  }

  // 3. FINISHED VIEW
  if (phase === 'finished') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Submitted!</h2>
          <p className="text-slate-600 mb-6">Thank you, {getDisplayName()}. Your responses have been recorded safely.</p>

          {result && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Your Score</p>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">{result.score} <span className="text-xl text-slate-400">/ {result.total}</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. ACTIVE TEST VIEW
  return (
    <div className="pb-32 select-none">

      {/* Sticky Proctoring Header */}
      <div className="sticky top-0 left-0 w-full bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 truncate hidden sm:block">{quiz.title}</h2>

        <div className="flex items-center gap-6">
          {warnings > 0 && (
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm bg-orange-50 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              Warnings: {warnings}/{MAX_WARNINGS}
            </div>
          )}

          {timeLeft !== null && (
            <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-3xl mx-auto p-6 space-y-8 mt-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
              <span className="text-blue-600 mr-2">{index + 1}.</span> {q.question_text}
            </h3>

            <div className="space-y-3">
              {q.options.map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    answers[q.id] === opt.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                    className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-600"
                  />
                  <span className="text-slate-700 font-medium">{opt.option_text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submission Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            Answered: {Object.keys(answers).length} / {questions.length}
          </p>
          <button
            onClick={() => handleComplete(false)}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>

    </div>
  );
}