import { Settings2, Trash2, UserPlus, CalendarDays, X } from "lucide-react";
import { QuizState, IntroField } from "../types";

interface Props {
  quiz: QuizState;
  onChange: (quiz: QuizState) => void;
}

export default function QuizSettings({ quiz, onChange }: Props) {
  const updateField = (field: keyof QuizState, value: any) => {
    onChange({ ...quiz, [field]: value });
  };

  // Helper to safely format ISO database strings into the exact YYYY-MM-DDThh:mm format required by HTML inputs
  const formatForInput = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* --- GENERAL SETTINGS CARD --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
          <Settings2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">General Settings</h2>
        </div>

        <div className="space-y-5 font-anek">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title *</label>
            <input
              type="text"
              placeholder="e.g. Midterm History Exam"
              value={quiz.title}
              onChange={e => updateField("title", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              placeholder="Instructions or notes for the respondents..."
              value={quiz.description}
              onChange={e => updateField("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
            />
          </div>

          {/* --- SCHEDULING SECTION WITH CLEAR BUTTONS --- */}
          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-400" /> Start Time (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={formatForInput(quiz.start_time)}
                  onChange={e => updateField("start_time", e.target.value || null)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                />
                {quiz.start_time && (
                  <button
                    type="button"
                    onClick={() => updateField("start_time", null)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Clear Start Time"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-400" /> End Time (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={formatForInput(quiz.end_time)}
                  onChange={e => updateField("end_time", e.target.value || null)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                />
                {quiz.end_time && (
                  <button
                    type="button"
                    onClick={() => updateField("end_time", null)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Clear End Time"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Precise Timer Inputs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit</label>
              <div className="flex items-center gap-2">

                {/* Minutes Input */}
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={typeof quiz.time_limit_seconds === 'number' ? Math.floor(quiz.time_limit_seconds / 60).toString() : ""}
                  onChange={e => {
                    if (e.target.value === "") {
                      const currentSecs = typeof quiz.time_limit_seconds === 'number' ? quiz.time_limit_seconds % 60 : 0;
                      updateField("time_limit_seconds", currentSecs === 0 ? null : currentSecs);
                      return;
                    }
                    const mins = parseInt(e.target.value) || 0;
                    const currentSecs = typeof quiz.time_limit_seconds === 'number' ? quiz.time_limit_seconds % 60 : 0;
                    updateField("time_limit_seconds", (mins * 60) + currentSecs);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                />
                <span className="text-slate-500 font-medium">m</span>

                {/* Seconds Input */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Sec"
                  value={typeof quiz.time_limit_seconds === 'number' ? (quiz.time_limit_seconds % 60).toString() : ""}
                  onChange={e => {
                    if (e.target.value === "") {
                      const currentMins = typeof quiz.time_limit_seconds === 'number' ? Math.floor(quiz.time_limit_seconds / 60) : 0;
                      updateField("time_limit_seconds", currentMins === 0 ? null : currentMins * 60);
                      return;
                    }
                    const secs = parseInt(e.target.value) || 0;
                    const currentMins = typeof quiz.time_limit_seconds === 'number' ? Math.floor(quiz.time_limit_seconds / 60) : 0;
                    updateField("time_limit_seconds", (currentMins * 60) + secs);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                />
                <span className="text-slate-500 font-medium">s</span>

              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quiz.shuffle_questions}
                  onChange={e => updateField("shuffle_questions", e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">Shuffle Questions</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quiz.show_results}
                  onChange={e => updateField("show_results", e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">Show score after submission</span>
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quiz.require_password}
                  onChange={e => updateField("require_password", e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">Require Password to enter</span>
              </label>
            </div>
            {quiz.require_password && (
              <div>
                <input
                  type="text"
                  placeholder="Enter quiz password"
                  value={quiz.quiz_password}
                  onChange={e => updateField("quiz_password", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DYNAMIC INTRO FORM BUILDER CARD --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Candidate Information Form</h2>
            <p className="text-sm text-slate-500">What details must candidates provide before starting?</p>
          </div>
        </div>

        <div className="space-y-4 font-anek">
          {(!quiz.intro_fields || quiz.intro_fields.length === 0) && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 text-center">
              No custom fields added. Candidates will only be asked for their "Full Name" by default.
            </div>
          )}

          {quiz.intro_fields?.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3 items-start w-full">
                <input
                  type="text"
                  placeholder="Field Label (e.g. Email, Class, Roll No)"
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...quiz.intro_fields];
                    newFields[index].label = e.target.value;
                    updateField("intro_fields", newFields);
                  }}
                  className="flex-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const newFields = [...quiz.intro_fields];
                      newFields[index].type = e.target.value as any;

                      if (e.target.value === 'select' && (!newFields[index].options || newFields[index].options.length === 0)) {
                        newFields[index].options = ["Class A", "Class B"];
                      }
                      updateField("intro_fields", newFields);
                    }}
                    className="flex-1 sm:w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none bg-white focus:border-blue-600"
                  >
                    <option value="text">Short Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone Number</option>
                    <option value="select">Dropdown</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      updateField("intro_fields", quiz.intro_fields.filter(f => f.id !== field.id));
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove Field"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {field.type === 'select' && (
                <div className="w-full pl-1 border-l-4 border-blue-400 mt-1">
                  <input
                    type="text"
                    placeholder="Separate options with commas (e.g. Math, Science, Art)"
                    value={field.options?.join(",") || ""}
                    onChange={(e) => {
                      const newFields = [...quiz.intro_fields];
                      newFields[index].options = e.target.value.split(",");
                      updateField("intro_fields", newFields);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 ml-2"
                  />
                  <p className="text-xs text-slate-500 mt-1 ml-2">Type your choices separated by a comma.</p>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newField: IntroField = { id: crypto.randomUUID(), label: "", type: "text", required: true };
              updateField("intro_fields", [...(quiz.intro_fields || []), newField]);
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors inline-block mt-2"
          >
            + Add Custom Field
          </button>
        </div>
      </div>
    </div>
  );
}