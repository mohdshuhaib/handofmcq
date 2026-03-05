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
  Sparkles,
  ChevronUp,
  Menu,
  X
} from "lucide-react";

// Import the signout Server Action
import { signout } from "@/app/auth/actions";

export default function Sidebar({ userEmail, userName }: { userEmail: string, userName: string }) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For Desktop Profile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // For Mobile Hamburger Drawer
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false); // For Mobile Profile (Inside Drawer)

  // Close everything whenever the page route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileSidebarOpen(false);
    setIsMobileProfileOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Quizzes", href: "/dashboard/quizzes", icon: FileQuestion },
    { name: "Results", href: "/dashboard/results", icon: Users },
  ];

  // Helper function to correctly determine active state
  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"; // Exact match for root dashboard
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* ========================================== */}
      {/* --- DESKTOP SIDEBAR (Glassmorphism UI) --- */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200 fixed left-0 top-0 z-50 shadow-sm">

        {/* Logo Area */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              MCQ<span className="text-blue-600">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Profile Dropdown */}
        <div className="p-4 border-t border-slate-100 relative bg-slate-50/50">

          {/* Click-away backdrop */}
          {isProfileOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
          )}

          {/* Animated Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-4 w-[calc(100%-2rem)] bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-3 py-2.5 mb-1 bg-slate-50/80 rounded-xl border border-slate-100/50">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{userEmail}</p>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>

              {/* Native Next.js Server Action Form for Logout */}
              <form action={signout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Sign out
                </button>
              </form>
            </div>
          )}

          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`relative z-50 flex items-center gap-3 w-full p-2 rounded-xl transition-all shadow-sm border text-left group ${isProfileOpen ? 'bg-white border-slate-200' : 'border-transparent hover:bg-white hover:border-slate-200'}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0 shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{userEmail}</p>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* --- MOBILE HEADER & SLIDE-OUT DRAWER --- */}
      {/* ========================================== */}

      {/* Top Header (Mobile) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 z-40 flex items-center justify-between px-5 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">MCQ<span className="text-blue-600">.</span></span>
        </Link>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-[55] bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-[60] w-72 bg-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              MCQ<span className="text-blue-600">.</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Bottom Profile */}
        <div className="p-4 border-t border-slate-100 relative bg-slate-50/50">

          {/* Click-away backdrop for mobile profile dropdown */}
          {isMobileProfileOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsMobileProfileOpen(false)}></div>
          )}

          {/* Animated Dropdown Menu (Inside Mobile Drawer) */}
          {isMobileProfileOpen && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-4 w-[calc(100%-2rem)] bg-white border border-slate-200/60 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-3 py-2.5 mb-1 bg-slate-50/80 rounded-xl border border-slate-100/50">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{userEmail}</p>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMobileSidebarOpen(false)} // Close entirely when clicked
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>

              {/* Native Next.js Server Action Form for Logout */}
              <form action={signout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Sign out
                </button>
              </form>
            </div>
          )}

          <button
            onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
            className={`relative z-50 flex items-center gap-3 w-full p-2 rounded-xl transition-all shadow-sm border text-left group ${isMobileProfileOpen ? 'bg-white border-slate-200' : 'border-transparent hover:bg-white hover:border-slate-200'}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0 shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{userEmail}</p>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

    </>
  );
}