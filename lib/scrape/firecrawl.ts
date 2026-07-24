import "server-only";

export function isFirecrawlConfigured(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY);
}

export interface WebResult {
  url: string;
  title: string;
  description: string;
}

export async function searchBrands(query: string, limit = 8): Promise<WebResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = await res.json();
    const web = json?.data?.web;
    if (!Array.isArray(web)) return [];
    return web.map((r: { url?: string; title?: string; description?: string }) => ({
      url: r.url ?? "",
      title: r.title ?? "",
      description: r.description ?? "",
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
