import { unlink } from "node:fs/promises";

const RESPONSE_BODY_MAX_BYTES = 64 * 1024; // 64KB

export const readAndCleanupResponseBody = async (
  filePath: string,
): Promise<{ responseBody: string; bodyTruncated: boolean }> => {
  let bodyTruncated = false;
  let responseBody = "";
  try {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const bytes = await file.arrayBuffer();
      const fullText = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      if (new TextEncoder().encode(fullText).length > RESPONSE_BODY_MAX_BYTES) {
        // Truncate by encoding to UTF-8 bytes, slicing, then decoding back safely
        const encoded = new TextEncoder().encode(fullText);
        const sliced = encoded.slice(0, RESPONSE_BODY_MAX_BYTES);
        responseBody = new TextDecoder("utf-8", { fatal: false }).decode(sliced);
        bodyTruncated = true;
      } else {
        responseBody = fullText;
      }
      await unlink(filePath);
    }
  } catch (err) {
    console.error(`Failed to read response body file:`, err);
  }
  return { responseBody, bodyTruncated };
};
