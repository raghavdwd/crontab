import { unlink } from "node:fs/promises";

const RESPONSE_BODY_MAX_BYTES = 64 * 1024; // 64KB

export const saveResponseBodyToFile = async (
  filePath: string,
): Promise<{ responseBody: string; bodyTruncated: boolean }> => {
  let bodyTruncated = false;
  let responseBody = "";
  try {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const text = await file.text();
      if (Buffer.byteLength(text, "utf8") > RESPONSE_BODY_MAX_BYTES) {
        const buf = Buffer.from(text, "utf8").subarray(0, RESPONSE_BODY_MAX_BYTES);
        responseBody = buf.toString("utf8");
        bodyTruncated = true;
      } else {
        responseBody = text;
      }
      await unlink(filePath);
    }
  } catch (err) {
    console.error(`Failed to read response body file:`, err);
  }
  return { responseBody, bodyTruncated };
};
