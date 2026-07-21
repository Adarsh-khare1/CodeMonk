import fetch from "node-fetch";

/* =========================================
   Judge0 Self-Hosted Configuration
========================================= */

const JUDGE0_URL = process.env.JUDGE0_URL || process.env.JUDGE0_API_URL || "http://localhost:2358";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

/* =========================================
   Language IDs (Judge0 CE v1.13.1)
========================================= */

const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63
};

/* =========================================
   Status Mapping
========================================= */

const STATUS_MAP = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error",
  8: "Runtime Error",
  9: "Runtime Error",
  10: "Runtime Error",
  11: "Runtime Error",
  12: "Runtime Error",
  13: "Internal Error",
  14: "Execution Error"
};

const MAX_WAIT_TIME = parseInt(process.env.JUDGE0_MAX_WAIT_MS || "30000", 10);
const POLL_INTERVAL = parseInt(process.env.JUDGE0_POLL_INTERVAL_MS || "750", 10);
const MEMORY_LIMIT_KB = 256000;

/* =========================================
   Headers
========================================= */

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (JUDGE0_API_KEY) {
    if (JUDGE0_URL.includes("rapidapi.com")) {
      headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
      headers["X-RapidAPI-Host"] = new URL(JUDGE0_URL).hostname;
    } else {
      headers["X-Auth-Token"] = JUDGE0_API_KEY;
    }
  }

  return headers;
};

/* =========================================
   Helpers
========================================= */

const normalizeOutput = (out) => {
  if (!out) return "";
  return out.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
};

const decodeBase64 = (value) => (value ? Buffer.from(value, "base64").toString() : "");

const createExecutionTimeoutResult = () => ({
  status: {
    id: 14,
    description: "Execution Error",
  },
  stdout: null,
  stderr: null,
  compile_output: null,
  message: Buffer.from(
    "Judge0 did not finish processing this submission within the configured polling window."
  ).toString("base64"),
  time: "0",
  memory: 0,
});

const classifyStatus = (result, diagnosticsText = "") => {
  const statusId = result?.status?.id;
  const mappedStatus = STATUS_MAP[statusId] || result?.status?.description || "Error";
  const loweredDiagnostics = diagnosticsText.toLowerCase();

  if (
    loweredDiagnostics.includes("memory limit") ||
    loweredDiagnostics.includes("out of memory") ||
    (mappedStatus === "Runtime Error" && Number(result?.memory || 0) >= MEMORY_LIMIT_KB)
  ) {
    return "Memory Limit Exceeded";
  }

  return mappedStatus;
};

const getStatusPriority = (status) => {
  switch (status) {
    case "Compilation Error":
      return 7;
    case "Memory Limit Exceeded":
      return 6;
    case "Time Limit Exceeded":
      return 5;
    case "Runtime Error":
      return 4;
    case "Internal Error":
    case "Execution Error":
      return 3;
    case "Wrong Answer":
      return 2;
    case "Accepted":
      return 1;
    default:
      return 0;
  }
};

const buildAggregateStatus = (results) => {
  if (!results.length) {
    return "Accepted";
  }

  return results.reduce((current, testResult) => {
    return getStatusPriority(testResult.status) > getStatusPriority(current)
      ? testResult.status
      : current;
  }, "Accepted");
};

const isFatalJudgeStatus = (status) => {
  return [
    "Compilation Error",
    "Runtime Error",
    "Time Limit Exceeded",
    "Memory Limit Exceeded",
    "Internal Error",
    "Execution Error",
  ].includes(status);
};

/* =========================================
   Submit Code
========================================= */

const submitToJudge0 = async (code, languageId, stdin, expectedOutput) => {
  const url = `${JUDGE0_URL}/submissions?base64_encoded=true`;


const body = {
  source_code: Buffer.from(code).toString("base64"),
  language_id: languageId,
  stdin: Buffer.from(stdin || "").toString("base64"),
  expected_output: Buffer.from(expectedOutput || "").toString("base64"),
  cpu_time_limit: 2,
  wall_time_limit: 3,
  memory_limit: 256000,
  enable_network: false
};

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();
  return data.token;
};

/* =========================================
   Get Result
========================================= */

const getSubmissionResult = async (token) => {
  const url = `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  return response.json();
};

/* =========================================
   Poll
========================================= */

const pollSubmission = async (token) => {
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_TIME) {
    const result = await getSubmissionResult(token);

    if (result.status.id !== 1 && result.status.id !== 2) {
      return result;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  const timeoutError = new Error("Execution Timeout");
  timeoutError.code = "JUDGE_TIMEOUT";
  throw timeoutError;
};

/* =========================================
   JDoodle API Integration
========================================= */

const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

const runTestCaseJDoodle = async (code, languageName, input, expectedOutput) => {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("JDoodle credentials (JDOODLE_CLIENT_ID & JDOODLE_CLIENT_SECRET) missing in .env");
  }

  const langMap = {
    c: { language: "c", versionIndex: "0" },
    cpp: { language: "cpp17", versionIndex: "0" },
    "c++": { language: "cpp17", versionIndex: "0" },
    java: { language: "java", versionIndex: "0" },
    python: { language: "python3", versionIndex: "3" },
    javascript: { language: "nodejs", versionIndex: "4" }
  };

  const config = langMap[languageName.toLowerCase()] || { language: "cpp17", versionIndex: "0" };

  const body = {
    clientId,
    clientSecret,
    script: code,
    stdin: input || "",
    language: config.language,
    versionIndex: config.versionIndex
  };

  const response = await fetch(JDOODLE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429 || errText.includes('Daily limit reached')) {
      throw new Error('JDoodle daily quota reached (200 free executions/day). Please wait until tomorrow or start your local Docker Judge0.');
    }
    throw new Error(`JDoodle error: ${errText}`);
  }

  const result = await response.json();

  if (result.error || result.statusCode === 429) {
    if (result.error?.includes('Daily limit reached') || result.statusCode === 429) {
      throw new Error('JDoodle daily quota reached (200 free executions/day). Please wait until tomorrow or start your local Docker Judge0.');
    }
    throw new Error(`JDoodle error: ${result.error}`);
  }

  const output = result.output || "";
  const actual = normalizeOutput(output);
  const expected = normalizeOutput(expectedOutput || "");

  let status = "Accepted";
  if (result.statusCode && result.statusCode !== 200) {
    status = "Compilation Error";
  }

  const passed = actual === expected;
  if (!passed && status === "Accepted") {
    status = "Wrong Answer";
  }

  const cpuTime = result.cpuTime ? parseFloat(result.cpuTime) * 1000 : 0;
  const memoryUsed = result.memory ? parseInt(result.memory, 10) : 0;

  return {
    input,
    status,
    passed,
    actual,
    expected,
    error: passed ? null : { message: output.split('\n')[0] || "Output mismatch", full: output, line: null },
    statusId: null,
    stdout: output,
    stderr: "",
    compileOutput: "",
    message: "",
    executionTime: cpuTime,
    memoryUsed
  };
};

/* =========================================
   Run Single Test
========================================= */

const runTestCase = async (code, languageId, languageName, input, expectedOutput) => {
  // Check if JDoodle flag or credentials are active
  if (process.env.USE_JDOODLE === "true" || (process.env.JDOODLE_CLIENT_ID && process.env.JDOODLE_CLIENT_SECRET)) {
    return runTestCaseJDoodle(code, languageName, input, expectedOutput);
  }

  const token = await submitToJudge0(code, languageId, input, expectedOutput);
  let result;

  try {
    result = await pollSubmission(token);
  } catch (error) {
    if (error?.code === "JUDGE_TIMEOUT" || error?.message === "Execution Timeout") {
      result = createExecutionTimeoutResult();
    } else {
      throw error;
    }
  }

  const stdout = decodeBase64(result.stdout);
  const stderr = decodeBase64(result.stderr);
  const compile = decodeBase64(result.compile_output);
  const message = decodeBase64(result.message);
  const actual = normalizeOutput(stdout);
  const expected = normalizeOutput(expectedOutput || "");
  const diagnosticsText = [compile, stderr, message].filter(Boolean).join("\n");
  const status = classifyStatus(result, diagnosticsText);
  const passed = status === "Accepted" && actual === expected;

  let errorObj = null;
  if (compile || stderr || message || isFatalJudgeStatus(status)) {
    const errorText = compile || stderr || message || result?.status?.description || "Error occurred";
    errorObj = {
      message: errorText.split('\n')[0] || "Error occurred",
      full: errorText,
      line: null
    };
  }

  return {
    input,
    status,
    passed,
    actual,
    expected,
    error: errorObj,
    statusId: result.status?.id || null,
    stdout,
    stderr,
    compileOutput: compile,
    message,
    executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
    memoryUsed: result.memory || 0
  };
};

/* =========================================
   Sample Tests (Public)
========================================= */

export const runSampleTests = async (code, sampleTests, language) => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) throw new Error("Unsupported Language");

  const results = [];
  let totalExecutionTime = 0;
  let maxMemoryUsed = 0;

  for (let i = 0; i < sampleTests.length; i++) {
    const t = sampleTests[i];
    const r = await runTestCase(code, languageId, language, t.input, t.expectedOutput);
    totalExecutionTime += r.executionTime;
    maxMemoryUsed = Math.max(maxMemoryUsed, r.memoryUsed);

    results.push({
      testCase: i + 1,
      status: r.status,
      passed: r.passed,
      input: r.input,  
      expected: r.expected,
      actual: r.actual,
      error: r.error
    });

    if (isFatalJudgeStatus(r.status)) {
      break;
    }
  }

  return {
    status: buildAggregateStatus(results),
    passed: results.filter((result) => result.passed).length,
    total: sampleTests.length,
    executionTime: totalExecutionTime,
    memoryUsed: maxMemoryUsed,
    results
  };

};

/* =========================================
   Final Judge (Hidden Tests)
========================================= */

export const judgeSubmission = async (code, testCases, language) => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) throw new Error("Unsupported Language");

  let passed = 0;
  let time = 0;
  let memory = 0;

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const t = testCases[i];
    const r = await runTestCase(code, languageId, language, t.input, t.expectedOutput);

    time += r.executionTime;
    memory = Math.max(memory, r.memoryUsed);

    if (r.passed) passed++;

    results.push({
      testCase: i + 1,
      status: r.status,
      passed: r.passed,
      input: r.input,
      expected: r.expected,
      actual: r.actual,
      error: r.error
    });

    if (isFatalJudgeStatus(r.status)) {
      break;
    }
  }

  const finalStatus = buildAggregateStatus(results);

  return {
    status: finalStatus,
    passed,
    total: testCases.length,
    executionTime: testCases.length > 0 ? Math.round(time / testCases.length) : 0,
    memoryUsed: memory,
    results
  };
};
