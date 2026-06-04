export const buildCurlCommand = (
  url: string,
  method?: string,
  headers?: { name: string; value: string; enabled: boolean }[],
  body?: string,
  timeout?: number,
): string => {
  const parts: string[] = [
    "curl",
    "-s",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}",
  ];

  const httpMethod = (method || "GET").toUpperCase();
  if (httpMethod !== "GET") {
    parts.push("-X", httpMethod);
  }

  const shQuote = (s: string) => "'" + s.replace(/'/g, `'"'"'`) + "'";

  if (headers) {
    for (const h of headers) {
      if (h.enabled && h.name.trim()) {
        const headerValue = `${h.name.trim()}: ${h.value.trim()}`;
        parts.push("-H", shQuote(headerValue));
      }
    }
  }

  if (body && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
    parts.push("-d", shQuote(body));
  }

  if (timeout && timeout > 0) {
    parts.push("--max-time", String(Math.ceil(timeout / 1000)));
  }

  parts.push(shQuote(url));

  return parts.join(" ");
};
