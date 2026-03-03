import { Save } from "lucide-react";

interface Props {
  questionCount: number;
  isSaving: boolean;
  onSave: (isPublished: boolean) => void;
}

export default function StickySaveBar({ questionCount, isSaving, onSave }: Props) {
  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p className="text-sm text-slate-500 hidden sm:block">
          {questionCount} Question{questionCount !== 1 ? 's' : ''} ready
        </p>
        <div className="flex gap-3 w-full sm:w-auto">
           <button
            onClick={() => onSave(false)}
            disabled={isSaving}
            className="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => onSave(true)}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Publish Quiz</>}
          </button>
        </div>
      </div>
    </div>
  );
}