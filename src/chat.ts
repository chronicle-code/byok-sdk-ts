import type {
  ChatRequest,
  ChatResponse,
  ChatStreamChunk,
} from "./types.js";
import { throwForStatus } from "./errors.js";
import { parseSSEStream } from "./streaming.js";

export interface ChatAPIOptions {
  baseUrl: string;
  apiKey: string;
  defaultUserId?: string;
  fetch: typeof globalThis.fetch;
}

/**
 * Chat endpoint wrapper.
 *
 * Provides both synchronous and streaming chat completions.
 */
export class ChatAPI {
  private opts: ChatAPIOptions;

  constructor(opts: ChatAPIOptions) {
    this.opts = opts;
  }

  /**
   * Send a chat completion request and receive a full response.
   */
  async create(request: ChatRequest): Promise<ChatResponse> {
    const userId = request.userId ?? this.opts.defaultUserId ?? "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.opts.apiKey}`,
      "X-Byok-User": userId,
    };
    if (request.sessionToken) {
      headers["X-Byok-Session"] = request.sessionToken;
    }

    const body: Record<string, unknown> = {
      messages: request.messages,
      stream: false,
    };
    if (request.qualityTier) body.quality_tier = request.qualityTier;
    if (request.lorevaultEntityRef) body.lorevault_entity_ref = request.lorevaultEntityRef;
    if (request.gameState) body.game_state = request.gameState;

    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await throwForStatus(response);
    }

    return (await response.json()) as ChatResponse;
  }

  /**
   * Send a streaming chat completion request. Returns an async iterator
   * that yields content chunks as they arrive via SSE.
   */
  async *stream(
    request: Omit<ChatRequest, "stream">
  ): AsyncGenerator<ChatStreamChunk, void, undefined> {
    const userId = request.userId ?? this.opts.defaultUserId ?? "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.opts.apiKey}`,
      "X-Byok-User": userId,
    };
    if (request.sessionToken) {
      headers["X-Byok-Session"] = request.sessionToken;
    }

    const body: Record<string, unknown> = {
      messages: request.messages,
      stream: true,
    };
    if (request.qualityTier) body.quality_tier = request.qualityTier;
    if (request.lorevaultEntityRef) body.lorevault_entity_ref = request.lorevaultEntityRef;
    if (request.gameState) body.game_state = request.gameState;

    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await throwForStatus(response);
    }

    yield* parseSSEStream(response);
  }
}
