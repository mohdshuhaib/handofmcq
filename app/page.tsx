import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, BarChart3, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center perspective-[2000px]">

      {/* --- BACKGROUND LIGHTING (3D Depth) --- */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none"></div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* --- CORE CONTENT --- */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 mt-[-10vh]">

        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:scale-105 hover:bg-white/10 transition-all cursor-default shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">The Next-Gen Testing Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-white drop-shadow-lg">
          Hand of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 animate-gradient-x">MCQ</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium">
          Create, manage, and proctor exams with military-grade security. Real-time analytics, dynamic forms, and seamless evaluation.
        </p>

        {/* CTA Button */}
        <Link
          href="/login"
          className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl overflow-hidden hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all duration-300 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2 text-lg">
            Enter Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* --- 3D CSS DASHBOARD MOCKUP --- */}
      {/* We use rotateX to tilt the UI backward, creating a pure CSS 3D effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] md:w-[90%] max-w-6xl z-10 pointer-events-none">
        <div
          className="w-full h-80 bg-slate-900/80 backdrop-blur-xl border-t border-l border-r border-slate-700/50 rounded-t-[40px] shadow-[0_-20px_80px_rgba(37,99,235,0.2)] flex items-start justify-center p-8 gap-6"
          style={{ transform: "rotateX(35deg) translateY(40px) translateZ(-100px)", transformStyle: "preserve-3d" }}
        >
          {/* Fake Dashboard Elements */}
          <div className="w-1/3 h-full bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-4 shadow-xl">
             <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-blue-400" /></div>
             <div className="w-3/4 h-4 bg-slate-700 rounded-full"></div>
             <div className="w-1/2 h-4 bg-slate-700/50 rounded-full"></div>
          </div>
          <div className="w-1/3 h-full bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-4 shadow-xl -translate-y-4">
             <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-400" /></div>
             <div className="w-3/4 h-4 bg-slate-700 rounded-full"></div>
             <div className="w-full h-20 bg-gradient-to-t from-purple-500/20 to-transparent rounded-lg mt-auto border-b-2 border-purple-500"></div>
          </div>
          <div className="w-1/3 h-full bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-4 shadow-xl hidden md:flex">
             <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Clock className="w-5 h-5 text-green-400" /></div>
             <div className="w-3/4 h-4 bg-slate-700 rounded-full"></div>
             <div className="w-1/2 h-4 bg-slate-700/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* --- MADE WITH LOVE FOOTER --- */}
      <div className="absolute bottom-6 z-50">
        <a
          href="https://shuhaibcv.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/90 border border-slate-700 backdrop-blur-md hover:bg-slate-800 hover:border-slate-500 transition-all hover:-translate-y-1 shadow-lg"
        >
          <span className="text-sm text-slate-400 font-medium">Made with</span>
          <span className="text-red-500 group-hover:scale-125 transition-transform duration-300 animate-pulse">❤️</span>
          <span className="text-sm font-bold text-slate-200">Shuhaib TVM</span>
        </a>
      </div>

    </main>
  );
}