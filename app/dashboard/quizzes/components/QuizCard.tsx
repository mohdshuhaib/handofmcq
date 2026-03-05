"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, Clock, Edit, FileBarChart, Trash2,
  Download, AlertTriangle, Loader2, X, Share2, Check, Copy
} from "lucide-react";
import { deleteQuiz, getQuizExportData } from "../actions";
import * as XLSX from "xlsx";

export default function QuizCard({ quiz }: { quiz: any }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Track copy states separately
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);

  const date = new Date(quiz.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const quizLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${quiz.id}`;

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteQuiz(quiz.id);
    if (!res.success) {
      alert(res.error || "Failed to delete quiz.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCopyText = async (text: string, type: 'link' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
      } else {
        setIsPasswordCopied(true);
        setTimeout(() => setIsPasswordCopied(false), 2000);
      }
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        if (type === 'link') {
          setIsLinkCopied(true);
          setTimeout(() => setIsLinkCopied(false), 2000);
        } else {
          setIsPasswordCopied(true);
          setTimeout(() => setIsPasswordCopied(false), 2000);
        }
      } catch (e) {
        alert("Failed to copy text.");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const res = await getQuizExportData(quiz.id);

    if (res.error || !res.success) {
      alert("Failed to gather export data.");
      setIsExporting(false);
      return;
    }

    const { quiz: fullQuiz, questions, options, submissions } = res;

    // --- SHEET 1: QUESTIONS & OPTIONS ---
    const questionsData = questions.map((q: any, i: number) => {
      const qOpts = options.filter((o: any) => o.question_id === q.id);
      const correctOpt = qOpts.find((o: any) => o.is_correct);

      return {
        "Q.No": i + 1,
        "Question": q.question_text,
        "Option 1": qOpts[0]?.option_text || "",
        "Option 2": qOpts[1]?.option_text || "",
        "Option 3": qOpts[2]?.option_text || "",
        "Option 4": qOpts[3]?.option_text || "",
        "Correct Answer": correctOpt?.option_text || "N/A",
        "Points": q.points
      };
    });

    // --- SHEET 2: ANALYTICS & SUBMISSIONS ---
    const submissionsData = submissions.map((sub: any, index: number) => {
      const percentage = sub.total_points > 0 ? Math.round((sub.score / sub.total_points) * 100) : 0;
      const minutes = Math.floor((sub.time_taken_seconds || 0) / 60);
      const seconds = (sub.time_taken_seconds || 0) % 60;

      let baseData: any = {
        "Rank": index + 1,
        "Name": sub.respondent_name,
        "Score": sub.score,
        "Total Points": sub.total_points,
        "Percentage (%)": percentage,
        "Time Taken": `${minutes}m ${seconds}s`,
        "Warnings": sub.cheat_warnings,
        "Date Submitted": new Date(sub.submitted_at).toLocaleString()
      };

      // Map dynamic fields
      if (sub.respondent_details) {
        Object.entries(sub.respondent_details).forEach(([key, value]) => {
          if (key === 'default_name' || value === sub.respondent_name) return;
          const fieldDef = fullQuiz.intro_fields?.find((f: any) => f.id === key);
          const label = fieldDef ? fieldDef.label : key;
          baseData[label] = value;
        });
      }

      return baseData;
    });

    // Generate Excel
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(questionsData);
    ws1["!cols"] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Questions Info");

    const ws2 = XLSX.utils.json_to_sheet(submissionsData.length > 0 ? submissionsData : [{"Message": "No submissions yet."}]);
    ws2["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Analytics");

    const safeTitle = fullQuiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `${safeTitle}_full_report.xlsx`);

    setIsExporting(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group relative">

        {/* Card Header & Info */}
        <div className="p-6 flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className={`px-2.5 py-1 text-xs font-bold rounded-md border shadow-sm ${
              quiz.is_published ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {quiz.is_published ? "Active" : "Draft"}
            </div>
            {quiz.require_password && (
              <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-orange-100">Protected</div>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{quiz.title}</h3>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 mb-4">
            <Clock className="w-3.5 h-3.5" /> Created on {date}
          </div>

          {/* Share Button (Opens Modal) */}
          {quiz.is_published ? (
             <button
               onClick={() => setShowShareModal(true)}
               className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
             >
               <Share2 className="w-4 h-4" />
               Share Quiz Link
             </button>
          ) : (
             <div className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-medium bg-slate-50 text-slate-400 border border-slate-200 border-dashed cursor-not-allowed">
               Publish to share
             </div>
          )}
        </div>

        {/* Card Actions (Bottom Bar) */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-2 grid grid-cols-4 gap-1">
          <Link href={`/dashboard/quizzes/${quiz.id}/edit`} className="flex flex-col items-center justify-center py-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors gap-1" title="Edit Quiz">
            <Edit className="w-4 h-4" />
            <span className="text-[10px] font-bold">Edit</span>
          </Link>

          <Link href={`/dashboard/results/${quiz.id}`} className="flex flex-col items-center justify-center py-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors gap-1" title="View Results">
            <FileBarChart className="w-4 h-4" />
            <span className="text-[10px] font-bold">Results</span>
          </Link>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-col items-center justify-center py-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors gap-1 disabled:opacity-50"
            title="Export Excel Report"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="text-[10px] font-bold">{isExporting ? '...' : 'Export'}</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex flex-col items-center justify-center py-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors gap-1"
            title="Delete Quiz"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[10px] font-bold">Delete</span>
          </button>
        </div>
      </div>

      {/* --- SHARE MODAL --- */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <button onClick={() => setShowShareModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <h3 className="text-xl font-black text-slate-900 mb-2">Share your quiz</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Copy the link below to share this quiz with your candidates.
              </p>

              <div className="space-y-4">
                {/* Link Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quiz Link</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={quizLink}
                      className="flex-1 bg-transparent border-none text-sm font-medium text-slate-700 px-3 outline-none"
                    />
                    <button
                      onClick={() => handleCopyText(quizLink, 'link')}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all shrink-0 ${
                        isLinkCopied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      {isLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Box (Only if protected) */}
                {quiz.require_password && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Access Password</label>
                    <div className="flex items-center gap-2 bg-orange-50/50 p-1.5 rounded-xl border border-orange-100">
                      <input
                        type="text"
                        readOnly
                        value={quiz.quiz_password || ""}
                        className="flex-1 bg-transparent border-none text-sm font-medium text-orange-800 px-3 outline-none"
                      />
                      <button
                        onClick={() => handleCopyText(quiz.quiz_password || "", 'password')}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all shrink-0 ${
                          isPasswordCopied ? 'bg-green-100 text-green-700' : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-100'
                        }`}
                      >
                        {isPasswordCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-orange-600 mt-2 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Candidates will need this password to start.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200 mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete this quiz?</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Are you absolutely sure? This will permanently delete <span className="font-bold text-slate-900">"{quiz.title}"</span>.
              </p>
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-6 flex items-start gap-3 text-red-800 text-sm font-medium">
                <Trash2 className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <p>This action will wipe all questions, candidate submissions, and analytical data associated with this test. This cannot be undone.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}