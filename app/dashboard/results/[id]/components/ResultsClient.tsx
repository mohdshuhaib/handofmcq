"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import StatCards from "./StatCards";
import SubmissionsTable from "./SubmissionsTable";

interface Props {
  quiz: { title: string };
  submissions: any[];
}

export default function ResultsClient({ quiz, submissions }: Props) {

  const handleExportToExcel = () => {
    // 1. Format the raw database data into a clean structure for the spreadsheet
    const excelData = submissions.map(sub => {
      const percentage = Math.round((sub.score / sub.total_points) * 100);
      return {
        "Respondent Name": sub.respondent_name,
        "Score": sub.score,
        "Total Points": sub.total_points,
        "Percentage": `${percentage}%`,
        "Cheating Warnings": sub.cheat_warnings,
        "Submission Date": new Date(sub.submitted_at).toLocaleDateString(),
        "Submission Time": new Date(sub.submitted_at).toLocaleTimeString()
      };
    });

    // 2. Generate the worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    // 3. Adjust column widths for better readability in Excel
    const wscols = [
      { wch: 25 }, // Name
      { wch: 10 }, // Score
      { wch: 15 }, // Total
      { wch: 15 }, // Percentage
      { wch: 20 }, // Warnings
      { wch: 20 }, // Date
      { wch: 20 }, // Time
    ];
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    // 4. Trigger the download using the Quiz Title as the filename
    const safeTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeTitle}_results.xlsx`);
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportToExcel}
          disabled={submissions.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Analytics Components */}
      <StatCards submissions={submissions} />

      {/* Detailed Table */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Detailed Submissions</h2>
      <SubmissionsTable submissions={submissions} />
    </div>
  );
}