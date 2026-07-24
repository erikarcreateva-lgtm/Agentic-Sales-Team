import "server-only";

// Google retired gemini-2.5-flash for new API keys after this app's docs were
// written; gemini-3.5-flash is the current stable successor.
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const TIMEOUT_MS = 15000;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export interface Turn {
  role: "user" | "model";
  text: string;
}

interface CallOpts {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  responseSchema?: object;
}

async function callGemini(system: string, turns: Turn[], opts: CallOpts): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const model = opts.model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature ?? 0.6,
    maxOutputTokens: opts.maxTokens ?? 700,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (opts.responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = opts.responseSchema;
  }

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") throw new Error("Gemini returned no text");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function geminiGenerate(system: string, turns: Turn[], opts: Omit<CallOpts, "responseSchema"> = {}): Promise<string> {
  return callGemini(system, turns, opts);
}

export async function geminiJSON<T>(system: string, turns: Turn[], schema: object, opts: Omit<CallOpts, "responseSchema"> = {}): Promise<T> {
  const text = await callGemini(system, turns, { ...opts, responseSchema: schema });
  return JSON.parse(text) as T;
}
