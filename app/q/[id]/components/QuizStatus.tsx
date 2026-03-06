"use client";

import { useState, useEffect } from "react";
import { Hourglass, CalendarX2, Ban, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

interface Props {
  status: "unavailable" | "not_started" | "ended";
  startTime?: string;
  endTime?: string;
  quizTitle?: string;
}

export default function QuizStatus({ status, startTime, endTime, quizTitle }: Props) {

  // FIX: Track component mount state to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // --- COUNTDOWN LOGIC ---
  const calculateTimeLeft = () => {
    if (!startTime) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    const difference = +new Date(startTime) - +new Date();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // FIX: Set isMounted to true exactly once after the browser hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status !== 'not_started') return;

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      if (newTime.total <= 0) {
        clearInterval(timer);
        // Time is up! Refresh the page so the server fetches the now-active quiz
        window.location.reload();
      } else {
        setTimeLeft(newTime);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status, startTime]);

  // Format dates cleanly for display
  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // STATE 1: NOT STARTED (Live Countdown Room)
  // ==========================================
  if (status === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6 font-anek relative overflow-hidden selection:bg-blue-200">
        {/* Decorative Gradient Blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
        <div className="relative z-10 w-full max-w-2xl">
          {/* Main Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 sm:p-10 text-center animate-in zoom-in-95 duration-500">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 shadow-inner mb-8">
              <Hourglass className="w-10 h-10 text-blue-600 animate-bounce" />
            </div>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              {quizTitle || "Upcoming Quiz"}
            </h1>
            {/* Description */}
            <p className="text-slate-500 text-lg sm:text-xl font-medium mb-12">
              The assessment will automatically begin in:
            </p>
            {/* Countdown Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition"
                >
                  <span className="text-4xl sm:text-5xl font-black text-blue-600 font-mono tracking-widest mb-2">
                    {isMounted ? unit.value.toString().padStart(2, '0') : '00'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Scheduled Time */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold">
              <Clock className="w-4 h-4 text-blue-500" />
              Scheduled for {isMounted ? formatDate(startTime) : '...'} (IST)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
// STATE 2: ENDED
// ==========================================
if (status === "ended") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 font-anek relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-red-200/30 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-xl shadow-slate-200/60 animate-in zoom-in-95 duration-500">

          {/* Icon */}
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-inner">
            <CalendarX2 className="w-12 h-12 text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Quiz Concluded
          </h2>

          {/* Description */}
          <p className="text-slate-500 font-medium mb-10 leading-relaxed text-base sm:text-lg">
            <span className="font-bold text-slate-700">
              {quizTitle}
            </span>{" "}
            has officially ended and is no longer accepting submissions.
          </p>

          {/* Closed Time Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Closed On
            </span>
            <span className="text-slate-700 font-semibold text-base">
              {isMounted ? formatDate(endTime) : "..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

  // ==========================================
// STATE 3: UNAVAILABLE / NOT FOUND
// ==========================================
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6 font-anek relative overflow-hidden">
    {/* Background Glow */}
    <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-slate-300/30 rounded-full blur-[140px] pointer-events-none"></div>
    <div className="relative z-10 w-full max-w-lg">
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-xl shadow-slate-200/60 animate-in zoom-in-95 duration-500">

        {/* Icon */}
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-200 shadow-inner">
          <Ban className="w-12 h-12 text-slate-400" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Not Available
        </h2>

        {/* Description */}
        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-base sm:text-lg">
          This quiz link is invalid, expired, or the assessment has been unpublished by the creator.
        </p>
        {/* Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-300/30"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          Build Your Own Quiz
        </Link>
      </div>
    </div>
  </div>
);
}