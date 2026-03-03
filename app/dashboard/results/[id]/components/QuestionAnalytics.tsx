import { Target, XCircle } from "lucide-react";

export default function QuestionAnalytics({ questions, submissions }: { questions: any[], submissions: any[] }) {
  if (submissions.length === 0) return null;

  // Calculate stats for each question
  const stats = questions.map(q => {
    let wrongCount = 0;
    let correctCount = 0;
    const correctOptionId = q.options.find((o: any) => o.is_correct)?.id;

    submissions.forEach(sub => {
      const selectedOptionId = sub.answers[q.id];
      if (selectedOptionId === correctOptionId) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    return {
      ...q,
      wrongCount,
      correctCount,
      errorRate: Math.round((wrongCount / submissions.length) * 100)
    };
  });

  // Filter for minimum 3 mistakes, sort by highest error rate, take top 3
  const mostMissed = [...stats]
    .filter(q => q.wrongCount >= 3)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 3);

  // If no questions meet the threshold, show a positive message
  if (mostMissed.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Most Missed Questions</h2>
        </div>
        <p className="text-slate-500 text-sm text-center py-4">
          No questions have been missed by 3 or more people yet. Great job! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Most Missed Questions (Top 3)</h2>
      </div>

      <div className="space-y-4">
        {mostMissed.map((q, i) => (
          <div key={q.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 line-clamp-2">
                <span className="text-slate-400 mr-2">#{i + 1}</span> {q.question_text}
              </p>
              <p className="text-xs text-slate-500 mt-1">Missed by {q.wrongCount} people</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xl font-extrabold text-red-600">{q.errorRate}%</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Error Rate</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}