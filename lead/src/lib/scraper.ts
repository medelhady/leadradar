const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const EXCLUDE_DOMAINS = [
  "sentry.io", "example.com", "domain.com", "email.com",
  "yoursite.com", "yourdomain.com", "company.com", "placeholder.com",
  "wixpress.com", "squarespace.com", "wordpress.com",
];

const PATHS = ["", "/contact", "/contact-us", "/about", "/about-us", "/team"];

function cleanEmails(emails: string[]): string[] {
  return [...new Set(emails)].filter((email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;
    if (EXCLUDE_DOMAINS.some((d) => domain.includes(d))) return false;
    if (email.endsWith(".png") || email.endsWith(".jpg") || email.endsWith(".gif")) return false;
    if (email.includes("noreply") || email.includes("no-reply")) return false;
    return true;
  });
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function scrapeEmails(websiteUrl: string): Promise<string[]> {
  let base = websiteUrl.trim();
  if (!base.startsWith("http")) base = "https://" + base;
  base = base.replace(/\/$/, "");

  const allEmails: string[] = [];

  await Promise.allSettled(
    PATHS.map(async (path) => {
      const url = base + path;
      const html = await fetchPage(url);
      if (!html) return;

      // Extract from raw HTML (catches mailto links, text, etc.)
      const found = html.match(EMAIL_REGEX) ?? [];

      // Also decode HTML entities and re-search
      const decoded = html
        .replace(/&#64;/g, "@")
        .replace(/&#x40;/g, "@")
        .replace(/\[at\]/gi, "@")
        .replace(/\(at\)/gi, "@")
        .replace(/\s*@\s*/g, "@");
      const foundDecoded = decoded.match(EMAIL_REGEX) ?? [];

      allEmails.push(...found, ...foundDecoded);
    })
  );

  return cleanEmails(allEmails);
}
