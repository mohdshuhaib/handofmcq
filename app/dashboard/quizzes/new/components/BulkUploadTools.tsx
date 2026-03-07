import { useRef } from "react";
import { UploadCloud, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Question } from "../types";

interface Props {
  onImport: (questions: Question[]) => void;
  onError: (msg: string) => void;
}

export default function BulkUploadTools({ onImport, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        const importedQuestions: Question[] = [];

        // Start reading from row 1 (skipping header row 0)
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || !row[0]) continue;

          const questionText = String(row[0] || "").trim();

          // NEW LOGIC: Row[1] is always the correct answer. Rows 2, 3, 4 are wrong options.
          const rawOptions = [row[1], row[2], row[3], row[4]].filter(Boolean);

          // Must have at least a correct answer and one wrong answer
          if (rawOptions.length < 2) continue;

          // Map options and set the very first one (index 0) as correct
          let options = rawOptions.map((optText, idx) => {
            const cleanOptText = String(optText).trim();
            return {
              id: crypto.randomUUID(),
              text: cleanOptText,
              isCorrect: idx === 0 // Automatically true ONLY for the first option in the row
            };
          });

          // NEW LOGIC: Shuffle the options array so the correct answer isn't always "Option 1" in the UI
          for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
          }

          // Parse points from column 6 (index 5), default to 1 if empty
          const pointsValue = parseInt(String(row[5])) || 1;

          importedQuestions.push({
            id: crypto.randomUUID(),
            text: questionText,
            points: pointsValue,
            options: options,
          });
        }

        if (importedQuestions.length > 0) {
          onImport(importedQuestions);
          onError("");
        } else {
          onError("Could not find valid questions. Please ensure you are using the correct template format.");
        }
      } catch (err) {
        onError("Error parsing the file. Please upload a valid .xlsx or .csv file.");
      }

      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    // NEW TEMPLATE FORMAT: Correct option is explicitly requested in Column B
    const ws = XLSX.utils.aoa_to_sheet([
      ["Question", "Correct Option", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3", "Marks (Optional)"],
      ["What is the capital of France?", "Paris", "London", "Berlin", "Madrid", "1"],
      ["Which planet is known as the Red Planet?", "Mars", "Earth", "Jupiter", "Venus", "2"]
    ]);
    const wb = XLSX.utils.book_new();

    // Adjust column widths for better readability in Excel
    ws["!cols"] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "MCQ_Template.xlsx");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 py-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl text-blue-700 font-semibold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
      >
        <UploadCloud className="w-5 h-5" /> Bulk Upload Excel/CSV
      </button>

      <button
        onClick={downloadTemplate}
        className="sm:w-auto px-6 py-4 border border-slate-200 bg-white rounded-2xl text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <Download className="w-5 h-5" /> Download Template
      </button>
    </div>
  );
}