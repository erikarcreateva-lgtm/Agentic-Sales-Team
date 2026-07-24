import type { LeadInput } from "./types";

const HEADER_ALIASES = {
  name: ["name", "brand", "contact", "contact name"],
  company: ["company", "brand name", "organization", "org"],
  email: ["email", "e-mail", "contact email"],
  platform: ["platform", "channel"],
};

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

// Parses name/company/email/platform from a CSV, matching common header
// spellings (see HEADER_ALIASES) rather than requiring an exact schema.
export function parseLeadsCsv(text: string): LeadInput[] {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const colIndex = (aliases: string[]) => header.findIndex((h) => aliases.includes(h));
  const nameIdx = colIndex(HEADER_ALIASES.name);
  const companyIdx = colIndex(HEADER_ALIASES.company);
  const emailIdx = colIndex(HEADER_ALIASES.email);
  const platformIdx = colIndex(HEADER_ALIASES.platform);

  const rows: LeadInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const name = (nameIdx >= 0 ? cells[nameIdx] : "")?.trim() ?? "";
    const company = (companyIdx >= 0 ? cells[companyIdx] : "")?.trim() ?? "";
    const email = (emailIdx >= 0 ? cells[emailIdx] : "")?.trim() ?? "";
    const platform = (platformIdx >= 0 ? cells[platformIdx] : "")?.trim() ?? "";
    const resolvedName = name || company;
    if (!resolvedName) continue;
    rows.push({
      name: resolvedName,
      company: company || undefined,
      email: email || undefined,
      platform: platform || undefined,
    });
  }
  return rows;
}
