"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lock, Clock, AlertTriangle, CheckCircle2, ShieldAlert,
  XCircle, ArrowLeft, ArrowRight, LayoutGrid, Check, Sparkles, X, ChevronRight, Loader2, Award
} from "lucide-react";
import { submitQuizAndGrade, verifyQuizPassword } from "../actions";
import Link from "next/link";

interface Option { id: string; option_text: string; }
interface Question { id: string; question_text: string; points: number; options: Option[]; }
interface IntroField { id: string; label: string; type: string; required: boolean; options?: string[]; }

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit_seconds: number | null;
  require_password: boolean;
  quiz_password?: string | null;
  intro_fields?: IntroField[] | null;
  show_results: boolean;
}

export default function QuizEngine({ quiz, questions }: { quiz: Quiz, questions: Question[] }) {
  const [phase, setPhase] = useState<'gate' | 'intro' | 'active' | 'finished'>('gate');
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.time_limit_seconds || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [showGridDrawer, setShowGridDrawer] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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
    setShowSubmitModal(false);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }

    const respondentName = getDisplayName();
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    const res = await submitQuizAndGrade(quiz.id, respondentName, answers, warnings, introDetails, timeTakenSeconds);

    if (res.success) {
      setResult({ score: res.score!, total: res.totalPoints! });
      setPhase('finished');
      setWarningModal(null);
    } else {
      alert("Error submitting quiz. Please notify your instructor.");
    }
    setIsSubmitting(false);
  }, [answers, introDetails, isSubmitting, quiz.id, warnings, getDisplayName, startTime]);

  // Separate effect to watch the timer
  useEffect(() => {
    if (phase !== 'active') return;

    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete(true);
    }

    return () => {
      clearInterval(timer);
    };
  }, [phase, timeLeft, handleComplete]);

  // Dedicated effect to watch warnings and trigger completion
  useEffect(() => {
    if (warnings >= MAX_WARNINGS && phase === 'active') {
      handleComplete(true);
    }
  }, [warnings, phase, handleComplete]);

  // Security Effect: Visibility, Context Menu, Shortcuts, and Screenshot Interception
  useEffect(() => {
    if (phase !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings(prev => {
          const newCount = prev + 1;
          if (newCount < MAX_WARNINGS) {
            setWarningModal({ show: true, currentCount: newCount });
          }
          return newCount;
        });
      }
    };

    const disableContext = (e: Event) => e.preventDefault();

    const blockShortcuts = (e: KeyboardEvent) => {
      // Prevent PrintScreen, Ctrl+P, Ctrl+S, Cmd+Shift+S, Cmd+Shift+3/4/5
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.ctrlKey && e.shiftKey && e.key === 's') ||
        (e.metaKey && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (err) { } // Try to clear clipboard
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", disableContext);
    document.addEventListener("copy", disableContext);
    document.addEventListener("cut", disableContext);
    document.addEventListener("paste", disableContext);
    document.addEventListener("keydown", blockShortcuts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("copy", disableContext);
      document.removeEventListener("cut", disableContext);
      document.removeEventListener("paste", disableContext);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, [phase]);

  const startQuiz = async () => {
    try { await document.documentElement.requestFullscreen(); } catch (e) { }
    setStartTime(Date.now());
    setPhase('active');
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (quiz.require_password) {
      setIsVerifyingPassword(true);
      try {
        const isValid = await verifyQuizPassword(quiz.id, password.trim());
        if (!isValid) {
          setAuthError("Incorrect password. Please try again.");
          setIsVerifyingPassword(false);
          return;
        }
      } catch (error) {
        setAuthError("An error occurred. Please try again.");
        setIsVerifyingPassword(false);
        return;
      }
      setIsVerifyingPassword(false);
    }

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

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const timeProgressPercent = timeLeft !== null && quiz.time_limit_seconds
    ? (timeLeft / quiz.time_limit_seconds) * 100
    : 100;

  // ==========================================
  // 1. GATEWAY PHASE (SPLIT LAYOUT)
  // ==========================================
  if (phase === 'gate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col lg:flex-row relative overflow-hidden selection:bg-blue-200">

        {/* Ambient Background Blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        {/* Top/Left Dark Gradient Panel */}
        <div className="absolute lg:relative top-0 w-full lg:w-5/12 h-[45vh] lg:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-b-[3rem] lg:rounded-none lg:rounded-r-[3rem] shadow-xl z-0 overflow-hidden">

          {/* Abstract glows */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>

          {/* Desktop Graphic */}
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-white px-12 text-center relative z-10 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-blue-500/20 rounded-[1.5rem] flex items-center justify-center mb-8 border border-blue-400/30 backdrop-blur-md shadow-2xl">
              <Lock className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Secure Gateway</h2>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              Please verify your identity to securely access this assessment. All sessions are strictly monitored.
            </p>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="relative z-10 w-full lg:w-7/12 flex items-center justify-center pt-[15vh] lg:pt-0 px-5 pb-12 lg:pb-0 min-h-screen">
          <div className="w-full max-w-md">

            {/* Floating Logo Icon (Mobile Only) */}
            <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-xl shadow-slate-900/20 mx-auto flex items-center justify-center -mb-10 relative z-20 border border-slate-100 rotate-3 transition-transform lg:hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            {/* Main White Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-8 sm:p-10 pt-16 lg:pt-10 border border-slate-200/60 w-full animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-right-8 duration-500">

              <h1 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">
                {quiz.title}
              </h1>

              <p className="text-slate-500 text-center mb-8 text-sm font-medium">
                {quiz.description}
              </p>

              {authError && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl text-center border border-red-100 flex items-center justify-center gap-2 animate-in shake">
                  <AlertTriangle className="w-4 h-4" /> {authError}
                </div>
              )}

              <form onSubmit={handleGateSubmit} className="space-y-5">

                {(!quiz.intro_fields || quiz.intro_fields.length === 0) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={introDetails['default_name'] || ""}
                      onChange={e => setIntroDetails({ ...introDetails, 'default_name': e.target.value })}
                      className="w-full rounded-xl border-0 bg-slate-50/80 px-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 outline-none transition-all font-medium"
                      placeholder="Enter your name"
                    />
                  </div>
                )}

                {quiz.intro_fields?.map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {field.label} *
                    </label>

                    {field.type === 'select' ? (
                      <select
                        required
                        value={introDetails[field.id] || ""}
                        onChange={e => setIntroDetails({ ...introDetails, [field.id]: e.target.value })}
                        className="w-full rounded-xl border-0 bg-slate-50/80 px-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 outline-none transition-all font-medium appearance-none"
                      >
                        <option value="" disabled>Select an option...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        required
                        value={introDetails[field.id] || ""}
                        onChange={e => setIntroDetails({ ...introDetails, [field.id]: e.target.value })}
                        className="w-full rounded-xl border-0 bg-slate-50/80 px-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 outline-none transition-all font-medium"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}

                {quiz.require_password && (
                  <div className="pt-5 border-t border-slate-100 mt-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Secure Password *
                    </label>

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-xl border-0 bg-slate-50/80 px-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 outline-none transition-all font-medium text-center tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isVerifyingPassword}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 group"
                  >
                    {isVerifyingPassword ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        Continue to Rules
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. INTRO PHASE (RULES & PROCTORING)
  // ==========================================
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col lg:flex-row relative overflow-hidden selection:bg-blue-200">

        {/* Ambient Background Blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        {/* Top/Left Dark Gradient Panel */}
        <div className="absolute lg:relative top-0 w-full lg:w-5/12 h-[45vh] lg:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-b-[3rem] lg:rounded-none lg:rounded-r-[3rem] shadow-xl z-0 overflow-hidden">

          {/* Abstract glows */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"></div>

          {/* Desktop-only graphic */}
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-white px-12 text-center relative z-10 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-orange-500/20 rounded-[1.5rem] flex items-center justify-center mb-8 border border-orange-400/30 backdrop-blur-md shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-orange-400" />
            </div>

            <h2 className="text-4xl font-black mb-4 tracking-tight">
              Proctoring Active
            </h2>

            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              Read the guidelines carefully. Anti-cheat measures are active and will strictly monitor tab switching.
            </p>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="relative z-10 w-full lg:w-7/12 flex items-center justify-center pt-[12vh] lg:pt-0 px-5 pb-12 lg:pb-0 min-h-screen">
          <div className="w-full max-w-xl">

            {/* Floating Logo Icon (Mobile Only) */}
            <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-xl shadow-slate-900/20 mx-auto flex items-center justify-center -mb-10 relative z-20 border border-slate-100 -rotate-3 transition-transform lg:hidden">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            {/* Main White Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-8 sm:p-10 pt-16 lg:pt-10 border border-slate-200/60 w-full animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-right-8 duration-500">

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8 tracking-tight">
                Examination Rules
              </h2>

              <div className="space-y-4 mb-10">

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Verified Identity</h4>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      You are registered as <span className="text-slate-900">{getDisplayName()}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Time Limit</h4>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {quiz.time_limit_seconds
                        ? `You have exactly ${formatTimeText(quiz.time_limit_seconds)} to finish.`
                        : 'There is no time limit for this quiz.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/80 border border-orange-200/70">
                  <div className="w-10 h-10 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Anti-Cheat Enabled</h4>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">
                      Switching tabs, using shortcuts, or screenshots will trigger a warning. Max {MAX_WARNINGS} warnings allowed.
                    </p>
                  </div>
                </div>

              </div>

              <button
                onClick={startQuiz}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] text-lg"
              >
                I Agree, Start Test
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. FINISHED PHASE (SUCCESS & PROMO)
  // ==========================================
  if (phase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col items-center justify-center p-6 selection:bg-blue-200 relative overflow-hidden">

        {/* Ambient Background Blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-slate-200/60 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">

          {/* Soft success glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-300/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Test Submitted!
            </h2>

            <p className="text-slate-500 font-medium mb-8">
              Thank you, {getDisplayName()}. Your responses have been safely recorded.
            </p>

            {quiz.show_results ? (
              result && (
                <div className="bg-slate-50/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Final Score
                  </p>

                  <p className="text-5xl font-black text-blue-600 tracking-tight">
                    {result.score}
                    <span className="text-2xl text-slate-400">
                      {" "} / {result.total}
                    </span>
                  </p>
                </div>
              )
            ) : (
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 text-sm font-medium text-slate-600 mb-2">
                Scores are currently hidden by the instructor.
              </div>
            )}
          </div>
        </div>

        {/* --- PROMO BANNER --- */}
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 delay-300 duration-500">
          <p className="text-slate-500 text-sm font-medium">
            Build your own secure, proctored exams for free.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-900 hover:bg-slate-50 hover:text-blue-600 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            Try Hand of MCQ
          </Link>
        </div>

      </div>
    );
  }

  // ==========================================
  // 4. ACTIVE TEST PHASE (IMMERSIVE DARK MODE)
  // ==========================================
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex flex-col relative select-none font-sans overflow-hidden">

      {/* CSS Anti-Print and Anti-Selection Rules */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print { body { display: none !important; } }
        * { user-select: none !important; -webkit-user-select: none !important; }
      `,
        }}
      />

      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-300/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-300/30 blur-[120px]"></div>
      </div>

      {/* --- WARNING MODAL --- */}
      {warningModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">

            {/* Top Warning Section */}
            <div className="bg-red-50 p-6 text-center border-b border-red-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-xl font-black text-red-700">
                Proctoring Alert!
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-slate-600 mb-3 font-medium text-sm leading-relaxed">
                You navigated away from the quiz tab. This behavior is monitored.
              </p>
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 font-black rounded-lg mb-6 tracking-wide">
                Warning {warningModal.currentCount} / {MAX_WARNINGS}
              </div>

              <button
                onClick={() => setWarningModal(null)}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.97]"
              >
                I Understand, Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMIT CONFIRMATION MODAL --- */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-8 text-center border border-slate-100">

            {/* Icon */}
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Submit Quiz?
            </h3>

            {/* Message */}
            {questions.length - answeredCount > 0 ? (
              <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
                You still have{" "}
                <span className="text-red-500 font-bold">
                  {questions.length - answeredCount} unattempted
                </span>{" "}
                questions. Are you sure you want to finish?
              </p>
            ) : (
              <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
                You have answered all questions. Ready to submit?
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors active:scale-[0.97]"
              >
                Cancel
              </button>

              <button
                onClick={() => handleComplete(false)}
                className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.97]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PART 4: TOP HEADER --- */}
      <header className="relative z-20 bg-white/90 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-b-[2rem] shadow-lg shadow-black/5 mx-2 sm:mx-4 mt-2 border border-slate-100">
        <h1 className="font-black text-slate-900 text-lg truncate pr-4 max-w-[65%] tracking-tight">
          {quiz.title}
        </h1>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 shrink-0"
        >
          Submit
        </button>
      </header>

      {/* --- PART 4B: INFO BAR --- */}
      <div className="relative z-10 px-6 pt-6 pb-4 flex items-center justify-between gap-4">

        {/* Question Number */}
        <div className="text-slate-700 font-bold text-lg tabular-nums shrink-0 w-12">
          Q. {currentQuestionIndex + 1}
        </div>

        {/* Time Progress */}
        <div className="flex-1 max-w-sm mx-auto flex flex-col items-center gap-1.5">
          {timeLeft !== null ? (
            <>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-200">

                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft < 60 ? "bg-red-500" : "bg-blue-500"
                    }`}
                  style={{ width: `${Math.max(0, timeProgressPercent)}%` }}
                ></div>
              </div>

              <span
                className={`text-xs font-bold font-mono tracking-widest ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-slate-500"
                  }`}
              >
                {formatTime(timeLeft)}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              No Time Limit
            </span>
          )}
        </div>

        {/* Answer Count */}
        <div className="text-slate-500 font-bold text-sm text-right shrink-0 w-12">
          <span className="text-slate-900">{answeredCount}</span>
          <span className="opacity-50">/{questions.length}</span>
        </div>
      </div>

      {/* --- PART 4C: MAIN QUESTION CARD --- */}
      <div className="relative z-10 flex-1 px-4 sm:px-6 pb-[120px] sm:pb-[140px] overflow-y-auto">

        <div
          className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] max-w-3xl mx-auto min-h-[50vh] flex flex-col animate-in slide-in-from-right-4 fade-in duration-300 border border-slate-100"
          key={currentQ.id}
        >

          {/* Question Header */}
          <div className="flex items-start font-anek justify-between gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentQ.question_text}
            </h2>
            <div className="shrink-0 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
              <Award className="w-4 h-4" />
              <span className="font-bold text-sm whitespace-nowrap">
                {currentQ.points} Mark{currentQ.points !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="space-y-3 mt-auto">

            {currentQ.options.map((opt) => {

              const isSelected = answers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    setAnswers({ ...answers, [currentQ.id]: opt.id })
                  }
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden group active:scale-[0.99] ${isSelected
                    ? "border-transparent text-white shadow-lg shadow-blue-500/20"
                    : "border-slate-200 hover:border-blue-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >

                  {/* Selected Gradient */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0"></div>
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-4">

                    <span className="font-semibold text-[15px] sm:text-base leading-snug">
                      {opt.option_text}
                    </span>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                        ? "border-white bg-white/20 text-white"
                        : "border-slate-300 group-hover:border-blue-300 text-transparent"
                        }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- PART 5: FLOATING BOTTOM NAVIGATION --- */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 w-full px-4 sm:px-6 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-slate-200 p-2 sm:p-3 rounded-3xl shadow-xl flex items-center justify-between pointer-events-auto">

          {/* Prev Button */}
          <button
            onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 active:scale-95 transition-all border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Grid Toggle Button */}
          <button
            onClick={() => setShowGridDrawer(true)}
            className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {/* Next Button */}
          <button
            onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-30 disabled:bg-slate-200 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-500/20"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* --- GRID DRAWER MODAL --- */}
      {showGridDrawer && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowGridDrawer(false)}
          ></div>

          <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2rem] z-[70] p-6 pb-[calc(env(safe-area-inset-bottom,1rem)+1rem)] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-slate-200 animate-in slide-in-from-bottom-full duration-300 ease-out max-h-[80vh] flex flex-col">

            {/* Drawer Header Stats */}
            <div className="flex items-center justify-between mb-8 max-w-xl mx-auto w-full">

              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-600 font-bold text-sm">
                  Attempted ({answeredCount})
                </span>
              </div>

              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-red-600 font-bold text-sm">
                  Unattempted ({questions.length - answeredCount})
                </span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 no-scrollbar max-w-xl mx-auto w-full">
              <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10 gap-2 sm:gap-3 p-1">
                {questions.map((q, i) => {

                  const isAnswered = !!answers[q.id]
                  const isCurrent = currentQuestionIndex === i

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(i)
                        setShowGridDrawer(false)
                      }}
                      className={`relative w-full aspect-square flex items-center justify-center text-sm sm:text-base font-bold rounded-full transition-all duration-200 active:scale-95 ${isAnswered
                          ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md shadow-green-500/30"
                          : "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                        }`}
                    >
                      {i + 1}
                      {/* Current Question Indicator */}
                      {isCurrent && (
                        <div className="absolute -inset-1 border-2 border-blue-400 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-6"></div>
          </div>
        </>
      )}

    </div>
  );
}