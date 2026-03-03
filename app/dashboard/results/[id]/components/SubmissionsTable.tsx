import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function SubmissionsTable({ submissions }: { submissions: any[] }) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
        <p className="text-slate-500 font-medium">No one has taken this quiz yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
              <th className="p-4 font-semibold whitespace-nowrap">Respondent Name</th>
              <th className="p-4 font-semibold whitespace-nowrap">Score</th>
              <th className="p-4 font-semibold whitespace-nowrap">Grade</th>
              <th className="p-4 font-semibold whitespace-nowrap">Proctoring Status</th>
              <th className="p-4 font-semibold whitespace-nowrap">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((sub) => {
              const percentage = Math.round((sub.score / sub.total_points) * 100);
              const date = new Date(sub.submitted_at);

              return (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{sub.respondent_name}</td>
                  <td className="p-4 text-slate-600">
                    {sub.score} / {sub.total_points}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      percentage >= 80 ? 'bg-green-100 text-green-700' :
                      percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {percentage}%
                    </span>
                  </td>
                  <td className="p-4">
                    {sub.cheat_warnings > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {sub.cheat_warnings} Warnings
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> Clean
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}