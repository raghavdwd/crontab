/**
 * Builds a curl command string based on the provided parameters.
 *
 * @param url - The URL to send the request to.
 * @param method - The HTTP method to use (e.g., GET, POST).
 * @param headers - An array of header objects with name, value, and enabled properties.
 * @param body - The request body to include for applicable HTTP methods.
 * @param timeout - The maximum time in milliseconds to allow for the request.
 * @param saveResponse - Whether to save the response body to a file.
 * @param bodyFilePath - The file path to save the response body if saveResponse is true.
 * @returns A string representing the constructed curl command.
 */

export const buildCurlCommand = (
  url: string,
  method?: string,
  headers?: { name: string; value: string; enabled: boolean }[],
  body?: string,
  timeout?: number,
  saveResponse = false,
  bodyFilePath?: string,
): string => {
  const parts: string[] = ["curl", "-s"];

  const shQuote = (s: string) => "'" + s.replace(/'/g, `'"'"'`) + "'";

  if (saveResponse && bodyFilePath) {
    parts.push("-o", shQuote(bodyFilePath));
  } else {
    parts.push("-o", "/dev/null");
  }

  parts.push("-w", "%{http_code}");

  const httpMethod = (method || "GET").toUpperCase();
  if (httpMethod !== "GET") {
    parts.push("-X", httpMethod);
  }

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
