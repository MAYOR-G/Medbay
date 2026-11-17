import { tavily } from "@tavily/core";
import { getServerEnv } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import type { MedicalCitationItem } from "@/types/domain.types";

export const TRUSTED_MEDICAL_DOMAINS = [
  "who.int",
  "nhs.uk",
  "cdc.gov",
  "nih.gov",
  "medlineplus.gov",
  "mayoclinic.org",
  "clevelandclinic.org",
  "msdmanuals.com",
] as const;

function extractSafeHttpsCitation(raw: {
  title?: string;
  url?: string;
  content?: string;
}): MedicalCitationItem | null {
  if (!raw.url) return null;
  try {
    const parsed = new URL(raw.url);
    if (parsed.protocol !== "https:") return null;
    const domain = parsed.hostname.replace(/^www\./, "");
    return {
      title: (raw.title?.trim() || domain).slice(0, 240),
      url: parsed.toString(),
      domain: domain.slice(0, 120),
      snippet: (raw.content?.trim() || "").slice(0, 500),
    };
  } catch {
    return null;
  }
}

/**
 * Queries Tavily Tier-1 authoritative medical domains with automatic Tier-2 open-web fallback
 * and graceful empty-array degradation when offline or unavailable.
 */
export async function searchMedicalAuthorities(
  query: string,
  maxResults = 4,
): Promise<MedicalCitationItem[]> {
  const cleanedQuery = query.trim().slice(0, 240);
  if (!cleanedQuery) return [];

  try {
    const { TAVILY_API_KEY } = getServerEnv();
    const client = tavily({ apiKey: TAVILY_API_KEY });

    const tier1 = await client.search(cleanedQuery, {
      includeDomains: [...TRUSTED_MEDICAL_DOMAINS],
      maxResults,
      searchDepth: "basic",
      timeout: 10,
    });

    const tier1Citations = (tier1.results ?? [])
      .map(extractSafeHttpsCitation)
      .filter((item): item is MedicalCitationItem => item !== null)
      .slice(0, maxResults);

    if (tier1Citations.length >= 1) {
      return tier1Citations;
    }

    const tier2 = await client.search(`${cleanedQuery} clinical medical reference`, {
      maxResults,
      searchDepth: "basic",
      timeout: 10,
    });

    return (tier2.results ?? [])
      .map(extractSafeHttpsCitation)
      .filter((item): item is MedicalCitationItem => item !== null)
      .slice(0, maxResults);
  } catch (err) {
    logEvent("warn", {
      service: "tavily",
      event: "medical_citation_search_degraded",
      errorCode: err instanceof Error ? err.name : "TAVILY_UNAVAILABLE",
    });
    return [];
  }
}
