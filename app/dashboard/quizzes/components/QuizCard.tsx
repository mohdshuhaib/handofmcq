"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Settings2, Edit3, Share2, Copy, CheckCircle2, X } from "lucide-react";

export default function QuizCard({ quiz }: { quiz: any }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // We use useEffect to get the window.location.origin safely on the client side
  useEffect(() => {
    setShareUrl(`${window.location.origin}/q/${quiz.id}`);
  }, [quiz.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      {/* --- THE CARD --- */}
      <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              quiz.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
            }`}>
              {quiz.is_published ? "Active" : "Draft"}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{quiz.title}</h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {quiz.description || "No description provided."}
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            {quiz.time_limit && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {quiz.time_limit} mins
              </div>
            )}
            {quiz.require_password && (
              <div className="flex items-center gap-1">
                <Settings2 className="w-4 h-4" />
                Password Protected
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50">
          <Link
            href={`/dashboard/quizzes/${quiz.id}/edit`} // Note: You will need to build this edit page later!
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border-r border-slate-100"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>
      </div>

      {/* --- THE SHARE MODAL --- */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Share Quiz</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {!quiz.is_published && (
                <div className="p-3 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100">
                  <strong>Note:</strong> This quiz is currently saved as a Draft. Students will not be able to access it until you publish it.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Direct Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                      copied ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {quiz.require_password && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quiz Password</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800">
                    {quiz.quiz_password}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Make sure to send this password securely to your students alongside the link.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}