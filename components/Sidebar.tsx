"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";

// Import the signout Server Action
import { signout } from "@/app/auth/actions";

export default function Sidebar({ userEmail, userName }: { userEmail: string, userName: string }) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close the dropdown whenever the page route changes
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Quizzes", href: "/dashboard/quizzes", icon: FileQuestion },
    { name: "Results", href: "/dashboard/results", icon: Users },
  ];

  return (
    <>
      {/* ========================================== */}
      {/* --- DESKTOP SIDEBAR (Glassmorphism UI) --- */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/60 fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

        {/* Logo Area */}
        <div className="p-6 border-b border-slate-200/60">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Hand of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">MCQ</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Profile Dropdown */}
        <div className="p-4 border-t border-slate-200/60 relative bg-slate-50/50">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-200 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0 shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{userEmail}</p>
            </div>
          </button>

          {/* Animated Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-4 w-[calc(100%-2rem)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Profile Settings
              </Link>
              <div className="h-px bg-slate-100 mx-4"></div>

              {/* Native Next.js Server Action Form for Logout */}
              <form action={signout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Log out
                </button>
              </form>

            </div>
          )}
        </div>
      </aside>

      {/* ========================================== */}
      {/* --- MOBILE NAVBAR (Bottom) & HEADER (Top)--- */}
      {/* ========================================== */}

      {/* Top Header (Fixed) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-50 flex items-center justify-between px-6 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">MCQ</span>
        </Link>
        <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </Link>
      </header>

      {/* Bottom Nav Bar (Fixed) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 z-50 px-2 pt-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center mb-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex flex-col items-center gap-1 p-2 rounded-xl min-w-[72px] transition-all duration-300 ${
                  isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? 'bg-blue-100' : 'bg-transparent group-hover:bg-slate-100'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}