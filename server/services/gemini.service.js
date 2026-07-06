import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const stripCodeFences = (text = '') =>
  text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const parseJsonResponse = (text) => {
  const cleaned = stripCodeFences(text);
  return JSON.parse(cleaned);
};

const formatProblemContext = (problem = {}) => ({
  title: problem.title || '',
  description: problem.description || '',
  constraints: Array.isArray(problem.constraints) ? problem.constraints : [],
  sampleTestCases: Array.isArray(problem.sampleTestCases)
    ? problem.sampleTestCases.map((testCase) => ({
        input: testCase.input || '',
        output: testCase.output || '',
        explanation: testCase.explanation || '',
      }))
    : [],
});

const generateJson = async (instruction, payload) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `${instruction}

Return only valid JSON with no markdown fences, no commentary, and no trailing text.

Payload:
${JSON.stringify(payload, null, 2)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJsonResponse(text);
};

export const reviewCodeWithGemini = async ({ code, language, problem }) => {
  const payload = {
    language,
    code,
    problem: formatProblemContext(problem),
  };

  return generateJson(
    `You are an expert competitive programming reviewer.
Analyze the user's solution for correctness, algorithmic quality, code quality, and edge-case handling.
Be strict, concise, and practical.

Return JSON in exactly this shape:
{
  "summary": "short paragraph",
  "correctness": "correct|likely-correct|uncertain|incorrect",
  "timeComplexity": "string",
  "spaceComplexity": "string",
  "strengths": ["string"],
  "issues": [
    {
      "title": "string",
      "severity": "low|medium|high",
      "explanation": "string",
      "lineHint": "string"
    }
  ],
  "edgeCases": ["string"],
  "nextSteps": ["string"]
}`,
    payload
  );
};

export const optimizeCodeWithGemini = async ({ code, language, problem }) => {
  const payload = {
    language,
    code,
    problem: formatProblemContext(problem),
  };

  return generateJson(
    `You are an expert code optimizer for interview-style problems.
Improve the user's code while preserving behavior.
Prefer clarity first, then performance.
If the code is already strong, keep changes minimal.

Return JSON in exactly this shape:
{
  "summary": "short paragraph",
  "optimizedCode": "full improved code",
  "timeComplexity": "string",
  "spaceComplexity": "string",
  "changes": ["string"],
  "tradeoffs": ["string"],
  "warnings": ["string"]
}`,
    payload
  );
};

export const chatWithGemini = async ({ message, code, language, problem, history = [] }) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are a helpful coding coach for a LeetCode-style platform.
Answer the user's question about their solution or the current problem.
Keep the answer practical and compact.
If you mention code changes, explain them clearly.

Conversation history:
${JSON.stringify(history, null, 2)}

Current problem:
${JSON.stringify(formatProblemContext(problem), null, 2)}

Language: ${language}

Current code:
${code}

User message:
${message}`;

  const result = await model.generateContent(prompt);
  return {
    reply: result.response.text().trim(),
  };
};
