import type { ChatStreamChunk } from "./types.js";

/**
 * Parse an SSE stream from a BYOK streaming chat response into an async
 * iterator of ChatStreamChunk objects.
 *
 * Compatible with both Node.js ReadableStream (>=18) and browser
 * ReadableStream. Uses only the WHATWG Streams API.
 */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<ChatStreamChunk, void, undefined> {
  const body = response.body;
  if (!body) {
    return;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (possibly incomplete) line in the buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "") continue;

        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);

          if (data === "[DONE]") {
            yield { content: "", done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.choices?.[0]?.delta;
            if (delta?.content) {
              yield { content: delta.content, done: false };
            }
            // Handle finish_reason on the last real chunk
            if (parsed?.choices?.[0]?.finish_reason) {
              yield { content: "", done: true };
              return;
            }
          } catch {
            // Non-JSON SSE line — skip silently (e.g. comments, keep-alive)
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith("data: ")) {
      const data = buffer.trim().slice(6);
      if (data === "[DONE]") {
        yield { content: "", done: true };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
