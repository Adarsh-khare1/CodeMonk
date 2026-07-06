import React from "react";

interface ErrorObject {
  message?: string;
  full?: string;
  line?: number | null;
}

interface TestCaseResult {
  testCase?: number | string;
  status?: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string | ErrorObject | null;
}

interface TestResults {
  passed: number;
  total: number;
  results: TestCaseResult[];
  status?: string;
  executionTime?: number;
  memoryUsed?: number;
}

interface Submission {
  status: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  aiFeedback?: string;
  executionTime?: number;
  memoryUsed?: number;
}

interface SubmissionResultType {
  error?: string;
  submission?: Submission;
  testResults?: TestResults;
}

interface SubmissionResultProps {
  result: SubmissionResultType | null;
}

export default function SubmissionResult({ result }: SubmissionResultProps) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="surface-primary border-red-500/30 bg-red-500/10 p-4 text-red-600 dark:text-red-300">
        {result.error}
      </div>
    );
  }
const status = result.submission?.status || result.testResults?.status;

// Helper to extract error message from error object or string
const getErrorMessage = (error: string | ErrorObject | null | undefined): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    return error.message || error.full || null;
  }
  return null;
};

// Helper to get error line
const getErrorLine = (error: string | ErrorObject | null | undefined): number | null => {
  if (!error || typeof error !== 'object' || error === null) return null;
  return error.line || null;
};

const compileError =
  ["Compilation Error", "Runtime Error", "Time Limit Exceeded", "Memory Limit Exceeded", "Internal Error", "Execution Error"].includes(result.testResults?.status || "")
    ? result.submission?.compile_output || getErrorMessage(result.testResults?.results[0]?.error)
    : null;


  return (
    <div className="surface-primary p-6">
      <h2 className="mb-4 text-xl font-bold tracking-tight">Submission Result</h2>

      {status && (
        <div
          className={`mb-4 text-lg font-semibold ${
            status === "Accepted" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {status}
        </div>
      )}

      {(result.testResults?.executionTime !== undefined || result.testResults?.memoryUsed !== undefined) && (
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="rounded-xl border border-border/60 bg-secondary/70 px-3 py-2">
            Time: {Math.round(result.testResults?.executionTime || 0)} ms
          </div>
          <div className="rounded-xl border border-border/60 bg-secondary/70 px-3 py-2">
            Memory: {result.testResults?.memoryUsed || 0} KB
          </div>
        </div>
      )}

      {/* GLOBAL COMPILATION ERROR */}
      {compileError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <b>Compilation / Runtime Error:</b>
          <div className="font-code mt-2 max-h-64 overflow-y-auto break-words whitespace-pre-wrap">
            {compileError}
          </div>
        </div>
      )}

      {/* TEST CASES */}
      {result.testResults && (
        <>
          <div className="mb-2 text-muted-foreground">
            Passed: {result.testResults.passed} / {result.testResults.total}
          </div>

          <div className="space-y-3">
            {result.testResults.results.map((r, i) => {
              const testCaseNum = r.testCase !== undefined ? r.testCase : i + 1;
              const errorMsg = getErrorMessage(r.error);
              const errorLine = getErrorLine(r.error);
              const testStatus = r.status || (r.passed ? "Accepted" : result.testResults?.status || "Failed");
              
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 text-sm ${
                    r.passed
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <div className="mb-2 font-semibold">
                    Test Case {testCaseNum}: {r.passed ? "Passed" : testStatus}
                  </div>

                  {errorMsg && (
                    <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-700 dark:text-red-300">
                      <div className="font-semibold">Error:</div>
                      <div className="whitespace-pre-wrap break-words">{errorMsg}</div>
                      {errorLine !== null && (
                        <div className="mt-1 text-red-600 dark:text-red-400">Line: {errorLine}</div>
                      )}
                    </div>
                  )}

                  <div className="font-code grid grid-cols-1 gap-4 text-xs text-foreground md:grid-cols-3">
                    <div>
                      <div className="mb-1 text-muted-foreground">Input</div>
                      <div className="code-surface max-h-32 overflow-y-auto break-words whitespace-pre-wrap p-2">
                        {r.input || ""}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-muted-foreground">Expected</div>
                      <div className="code-surface max-h-32 overflow-y-auto break-words whitespace-pre-wrap p-2">
                        {r.expectedOutput || ""}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-muted-foreground">Your Output</div>
                      <div className="code-surface max-h-32 overflow-y-auto break-words whitespace-pre-wrap p-2">
                        {r.actualOutput || ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
