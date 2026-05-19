export type UtmParams = {
  source: string | null;
  campaign: string | null;
  content: string | null;
  medium: string | null;
};

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readUtmFromUrl(): UtmParams {
  if (typeof window === "undefined") {
    return { source: null, campaign: null, content: null, medium: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    source: normalize(params.get("utm_source")),
    campaign: normalize(params.get("utm_campaign")),
    content: normalize(params.get("utm_content")),
    medium: normalize(params.get("utm_medium")),
  };
}

export function serializeUtmForStorage(utm: UtmParams): string | null {
  const entries: Record<string, string> = {};
  if (utm.source) entries.source = utm.source;
  if (utm.campaign) entries.campaign = utm.campaign;
  if (utm.content) entries.content = utm.content;
  if (utm.medium) entries.medium = utm.medium;
  if (Object.keys(entries).length === 0) return null;
  return JSON.stringify(entries);
}
