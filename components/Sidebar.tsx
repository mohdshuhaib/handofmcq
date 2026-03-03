"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  Settings,
  LogOut
} from "lucide-react";

export default function Sidebar({ userEmail, userName }: { userEmail: string, userName: string }) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- NEW: Automatically close the dropdown whenever the page route changes ---
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
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0">
        <div className="p-6 border-b border-slate-200">
          <Link href="/dashboard" className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hand of <span className="text-blue-600">MCQ</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Profile Dropdown */}
        <div className="p-4 border-t border-slate-200 relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-4 w-[calc(100%-2rem)] mb-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsProfileOpen(false)} // <-- NEW: Instant close on click
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </Link>
              <form action="/auth/signout" method="post" className="border-t border-slate-100">
                <button type="submit" className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left">
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* --- MOBILE NAVBAR (Bottom) & HEADER (Top) --- */}
      <div className="md:hidden flex flex-col w-full h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <span className="text-xl font-extrabold text-slate-900">Hand of <span className="text-blue-600">MCQ</span></span>
          <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {userName.charAt(0).toUpperCase()}
          </Link>
        </header>

        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 z-10 pb-safe">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[64px] ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}