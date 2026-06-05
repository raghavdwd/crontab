import { unlink } from "node:fs/promises";

const RESPONSE_BODY_MAX_BYTES = 64 * 1024; // 64KB

/**
 * Saves the response body to a file, ensuring it does not exceed the maximum allowed size.
 * If the file already exists, it reads the content and truncates it if necessary before saving.
 *
 * @param responseBody - The response body to be saved.
 * @param filePath - The path where the response body should be saved.
 */

export const saveResponseBodyToFile = async (
  responseBody: string,
  filePath: string,
): Promise<void> => {
  let bodyTruncated = false;
  try {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const text = await file.text();
      if (text.length > RESPONSE_BODY_MAX_BYTES) {
        responseBody = text.slice(0, RESPONSE_BODY_MAX_BYTES);
        bodyTruncated = true;
      } else {
        responseBody = text;
        bodyTruncated = false;
      }
      await unlink(filePath);
    }
  } catch (err) {
    console.error(`Failed to read response body file:`, err);
  }
};
