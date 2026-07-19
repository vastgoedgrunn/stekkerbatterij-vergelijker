export type UserAgentHint = {
  label: string;
  likelyBot: boolean;
};

const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|phantom|selenium|httpclient|python-requests|curl|wget|go-http|scrapy|ahrefs|semrush|bingpreview|linkedinbot|twitterbot|discordbot|whatsapp|telegram/i;

/** Compacte UA-classificatie voor admin (geen zware bot-engine). */
export function classifyUserAgent(userAgent: string | null | undefined): UserAgentHint {
  if (!userAgent?.trim()) {
    return { label: "Onbekend", likelyBot: false };
  }
  const ua = userAgent.trim();
  if (BOT_PATTERN.test(ua)) {
    return { label: "Waarschijnlijk bot", likelyBot: true };
  }
  if (/Edg\//i.test(ua)) return { label: "Edge", likelyBot: false };
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return { label: "Chrome", likelyBot: false };
  if (/Firefox\//i.test(ua)) return { label: "Firefox", likelyBot: false };
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return { label: "Safari", likelyBot: false };
  if (/Mobile|Android|iPhone/i.test(ua)) return { label: "Mobiel", likelyBot: false };
  return { label: "Browser", likelyBot: false };
}
