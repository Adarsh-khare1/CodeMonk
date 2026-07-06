import { RotateCcw, Save } from 'lucide-react';

import { User } from '@/types/user';


interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  codeSaved: boolean;
  user: User | null;
  language: string;
  onLanguageChange: (language: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
];

export default function CodeEditor({
  code,
  onCodeChange,
  onSubmit,
  onReset,
  submitting,
  codeSaved,
  user,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  return (
    <div className="surface-primary overflow-hidden">
      <div className="hairline-divider flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">Code Editor</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={submitting}
            className="input-surface px-2.5 py-1.5 text-sm"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          {codeSaved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Save className="h-3 w-3" />
              Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            title="Reset code"
            aria-label="Reset code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !code.trim()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50"
            aria-label="Submit code"
          >
            {submitting ? 'Running...' : user ? 'Submit' : 'Login to Submit'}
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="font-code h-96 w-full resize-none bg-background/70 p-4 text-sm text-foreground focus:outline-none"
        spellCheck={false}
        placeholder="Write your solution here..."
      />
    </div>
  );
}
