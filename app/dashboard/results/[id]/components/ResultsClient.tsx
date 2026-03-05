"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import StatCards from "./StatCards";
import SubmissionsTable from "./SubmissionsTable";
import QuestionAnalytics from "./QuestionAnalytics";

interface Props {
  quiz: any;
  submissions: any[];
  questions: any[];
}

export default function ResultsClient({ quiz, submissions, questions }: Props) {

  // RANKING LOGIC: Sort by Score (Desc), then by Time Taken (Asc)
  const rankedSubmissions = useMemo(() => {
    return [...submissions]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score; // Highest score first
        // Tie-breaker: Lowest time first
        return (a.time_taken_seconds || 999999) - (b.time_taken_seconds || 999999);
      })
      .map((sub, index) => ({ ...sub, rank: index + 1 })); // Assign Rank 1, 2, 3...
  }, [submissions]);

  const handleExportToExcel = () => {
    const excelData = rankedSubmissions.map(sub => {
      const percentage = Math.round((sub.score / sub.total_points) * 100);
      const minutes = Math.floor((sub.time_taken_seconds || 0) / 60);
      const seconds = (sub.time_taken_seconds || 0) % 60;

      let baseData: any = {
        "Rank": sub.rank,
        "Name": sub.respondent_name,
        "Score": sub.score,
        "Total Points": sub.total_points,
        "Percentage": `${percentage}%`,
        "Time Taken": `${minutes}m ${seconds}s`,
        "Cheating Warnings": sub.cheat_warnings,
        "Submitted": new Date(sub.submitted_at).toLocaleString()
      };

      // Exact Custom Data mapping (Using real labels instead of IDs)
      if (sub.respondent_details) {
        Object.entries(sub.respondent_details).forEach(([key, value]) => {
          // Skip default name or exact duplicate of the main respondent name
          if (key === 'default_name' || value === sub.respondent_name) return;

          // Map ID to the actual custom label creator wrote
          const fieldDef = quiz.intro_fields?.find((f: any) => f.id === key);
          const label = fieldDef ? fieldDef.label : key;

          // Show pure data
          baseData[label] = value;
        });
      }

      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    worksheet["!cols"] = [ { wch: 5 }, { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 } ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const safeTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeTitle}_results.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportToExcel}
          disabled={submissions.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Leaderboard
        </button>
      </div>

      <StatCards submissions={rankedSubmissions} />

      <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Live Leaderboard</h2>
      {/* Pass the quiz object here so we can read the field labels! */}
      <SubmissionsTable submissions={rankedSubmissions} questions={questions} quiz={quiz} />

      <div className="mt-12">
        <QuestionAnalytics questions={questions} submissions={rankedSubmissions} />
      </div>
    </div>
  );
}