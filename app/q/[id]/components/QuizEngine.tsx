"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Clock, AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { submitQuizAndGrade } from "../actions";

interface Option { id: string; option_text: string; }
interface Question { id: string; question_text: string; points: number; options: Option[]; }
interface IntroField { id: string; label: string; type: string; required: boolean; options?: string[]; }
interface Quiz {
  id: string; title: string; description: string;
  time_limit_seconds: number | null; require_password: boolean;
  intro_fields?: IntroField[]; show_results: boolean;
}

export default function QuizEngine({ quiz, questions }: { quiz: Quiz, questions: Question[] }) {
  const [phase, setPhase] = useState<'gate' | 'intro' | 'active' | 'finished'>('gate');
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.time_limit_seconds || null);

  // --- NEW: Time Tracking & Warning Modal States ---
  const [startTime, setStartTime] = useState<number>(0);
  const [warnings, setWarnings] = useState(0);
  const [warningModal, setWarningModal] = useState<{ show: boolean, currentCount: number } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [introDetails, setIntroDetails] = useState<Record<string, string>>({});

  const MAX_WARNINGS = 3;

  const getDisplayName = useCallback(() => {
    if (introDetails['default_name']) return introDetails['default_name'];
    const nameField = quiz.intro_fields?.find(f => f.label.toLowerCase().includes("name"));
    if (nameField && introDetails[nameField.id]) return introDetails[nameField.id];
    return "Respondent";
  }, [introDetails, quiz.intro_fields]);

  const handleComplete = useCallback(async (forced: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const respondentName = getDisplayName();

    // Calculate exact time taken in seconds
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    const res = await submitQuizAndGrade(quiz.id, respondentName, answers, warnings, introDetails, timeTakenSeconds);

    if (res.success) {
      setResult({ score: res.score!, total: res.totalPoints! });
      setPhase('finished');
      setWarningModal(null); // Clear any open warnings
    } else {
      alert("Error submitting quiz. Please notify your instructor.");
    }
    setIsSubmitting(false);
  }, [answers, introDetails, isSubmitting, quiz.id, warnings, getDisplayName, startTime]);

  useEffect(() => {
    if (phase !== 'active') return;

    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete(true);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_WARNINGS) {
             handleComplete(true);
          } else {
             // Show Modern Warning Modal instead of alert()
             setWarningModal({ show: true, currentCount: newCount });
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

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

  const startQuiz = async () => {
    try { await document.documentElement.requestFullscreen(); } catch (e) {}
    setStartTime(Date.now()); // START THE CLOCK
    setPhase('active');
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('intro');
  };

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
          <form onSubmit={handleGateSubmit} className="space-y-4">
            {(!quiz.intro_fields || quiz.intro_fields.length === 0) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" required value={introDetails['default_name'] || ""} onChange={e => setIntroDetails({...introDetails, 'default_name': e.target.value})} className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none" />
              </div>
            )}
            {quiz.intro_fields?.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && '*'}</label>
                {field.type === 'select' ? (
                  <select required={field.required} value={introDetails[field.id] || ""} onChange={e => setIntroDetails({...introDetails, [field.id]: e.target.value})} className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none bg-white">
                    <option value="" disabled>Select an option...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type={field.type} required={field.required} value={introDetails[field.id] || ""} onChange={e => setIntroDetails({...introDetails, [field.id]: e.target.value})} className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none" />
                )}
              </div>
            ))}
            {quiz.require_password && (
              <div className="pt-4 border-t border-slate-100 mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none" />
              </div>
            )}
            <button type="submit" className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Continue</button>
          </form>
        </div>
      </div>
    );
  }

  // 2. INTRO VIEW
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
            <li className="flex gap-3"><Clock className="w-6 h-6 text-slate-500 shrink-0" /> <strong>Time Limit:</strong> {quiz.time_limit_seconds ? `${formatTimeText(quiz.time_limit_seconds)}. Test auto-submits when time expires.` : 'No time limit.'}</li>
            <li className="flex gap-3"><Lock className="w-6 h-6 text-slate-500 shrink-0" /> <strong>Fullscreen Required:</strong> Browser will enter full screen mode.</li>
            <li className="flex gap-3"><AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" /> <strong>Anti-Cheat Active:</strong> Switching tabs or apps is recorded. You have {MAX_WARNINGS} warnings before instant termination.</li>
          </ul>
          <button onClick={startQuiz} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-lg">I Agree, Start Test</button>
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

          {/* Only show result if the creator enabled it */}
          {quiz.show_results ? (
            result && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Your Score</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">{result.score} <span className="text-xl text-slate-400">/ {result.total}</span></p>
              </div>
            )
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
              Results are hidden for this quiz. Contact your instructor for your final grade.
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. ACTIVE TEST VIEW
  return (
    <div className="pb-32 select-none relative">

      {/* --- MODERN WARNING MODAL --- */}
      {warningModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-red-500">
            <div className="bg-red-50 p-6 text-center border-b border-red-100">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-700">Proctoring Warning!</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-700 mb-2 font-medium">
                You navigated away from the quiz tab. This is considered suspicious behavior.
              </p>
              <p className="text-red-600 font-bold text-lg mb-6">
                Warning {warningModal.currentCount} of {MAX_WARNINGS}
              </p>
              <button
                onClick={() => setWarningModal(null)}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                I Understand, Return to Test
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className={`flex items-center gap-2 font-mono text-xl font-black ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              <Clock className="w-6 h-6" />
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
                <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${ answers[q.id] === opt.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50' }`}>
                  <input type="radio" name={q.id} value={opt.id} checked={answers[q.id] === opt.id} onChange={() => setAnswers({ ...answers, [q.id]: opt.id })} className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-600" />
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
          <p className="text-sm text-slate-500 font-medium">Answered: {Object.keys(answers).length} / {questions.length}</p>
          <button onClick={() => handleComplete(false)} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>

    </div>
  );
}