import type { PlayerState, UpdateStateRequest } from "./types.js";
import { throwForStatus } from "./errors.js";

export interface StateAPIOptions {
  baseUrl: string;
  apiKey: string;
  defaultUserId?: string;
  fetch: typeof globalThis.fetch;
}

/**
 * Player state: markers, location, and custom persistent data.
 */
export class StateAPI {
  private opts: StateAPIOptions;

  constructor(opts: StateAPIOptions) {
    this.opts = opts;
  }

  private authHeaders(userId?: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.opts.apiKey}`,
      "X-Byok-User": userId ?? this.opts.defaultUserId ?? "",
    };
  }

  /**
   * Get the current player state for the authenticated game+user.
   *
   * GET /api/v1/state
   */
  async get(userId?: string): Promise<PlayerState> {
    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/state`, {
      headers: this.authHeaders(userId),
    });
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as PlayerState;
  }

  /**
   * Update player state. Markers are merged additively, custom data is
   * deep-merged.
   *
   * POST /api/v1/state
   */
  async update(request: UpdateStateRequest, userId?: string): Promise<PlayerState> {
    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/state`, {
      method: "POST",
      headers: this.authHeaders(userId),
      body: JSON.stringify(request),
    });
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as PlayerState;
  }
}
