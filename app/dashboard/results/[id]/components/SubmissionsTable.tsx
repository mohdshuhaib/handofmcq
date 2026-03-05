import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Search, Medal } from "lucide-react";

export default function SubmissionsTable({ submissions, questions }: { submissions: any[], questions: any[] }) {
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds) return "--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (submissions.length === 0) {
    return <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed"><p className="text-slate-500">No one has taken this quiz yet.</p></div>;
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-semibold whitespace-nowrap">Rank</th>
                <th className="p-4 font-semibold whitespace-nowrap">Respondent</th>
                <th className="p-4 font-semibold whitespace-nowrap">Score</th>
                <th className="p-4 font-semibold whitespace-nowrap">Time Taken</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const percentage = Math.round((sub.score / sub.total_points) * 100);
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      {sub.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500" /> :
                       sub.rank === 2 ? <Medal className="w-6 h-6 text-slate-400" /> :
                       sub.rank === 3 ? <Medal className="w-6 h-6 text-amber-600" /> :
                       <span className="font-bold text-slate-500 ml-2">#{sub.rank}</span>}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{sub.respondent_name}</p>
                      {/* Show custom intro fields like Email or Class beneath the name */}
                      {sub.respondent_details && Object.values(sub.respondent_details).map((detail: any, i) => (
                        <span key={i} className="text-xs text-slate-500 mr-2">{detail}</span>
                      ))}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{sub.score} / {sub.total_points}</span>
                        <span className="text-xs font-semibold text-slate-500">{percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-600">
                      {formatTime(sub.time_taken_seconds)}
                    </td>
                    <td className="p-4">
                      {sub.cheat_warnings > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                          <AlertTriangle className="w-3 h-3" /> {sub.cheat_warnings} Warnings
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          <CheckCircle2 className="w-3 h-3" /> Clean
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedSub(sub)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Search className="w-4 h-4" /> View Paper
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RESPONDENT PAPER MODAL --- */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center font-anek justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedSub.respondent_name}'s Paper</h3>
                <p className="text-sm font-medium text-slate-500">Score: {selectedSub.score} | Time: {formatTime(selectedSub.time_taken_seconds)}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body: The Questions */}
            <div className="p-6 overflow-y-auto space-y-6">
              {questions.map((q, i) => {
                const selectedOptionId = selectedSub.answers[q.id];
                const correctOption = q.options.find((o: any) => o.is_correct);
                const isCorrect = selectedOptionId === correctOption?.id;

                return (
                  <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <div className="flex gap-3 mb-4">
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                      <h4 className="font-semibold text-slate-900">{i + 1}. {q.question_text}</h4>
                    </div>

                    <div className="space-y-2 pl-8">
                      {q.options.map((opt: any) => {
                        const isSelected = selectedOptionId === opt.id;
                        return (
                          <div key={opt.id} className={`p-2 rounded-lg text-sm flex items-center justify-between ${
                            opt.is_correct ? 'bg-green-100 text-green-800 font-bold' :
                            isSelected && !isCorrect ? 'bg-red-100 text-red-800 font-bold' : 'bg-white border text-slate-600'
                          }`}>
                            <span>{opt.option_text}</span>
                            {opt.is_correct && <span className="text-[10px] uppercase tracking-wider">Correct Answer</span>}
                            {isSelected && !opt.is_correct && <span className="text-[10px] uppercase tracking-wider">They Picked</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}