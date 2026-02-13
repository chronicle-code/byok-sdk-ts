import type { WalletResponse } from "./types.js";
import { throwForStatus } from "./errors.js";

export interface WalletAPIOptions {
  baseUrl: string;
  apiKey: string;
  defaultUserId?: string;
  fetch: typeof globalThis.fetch;
}

/**
 * Wallet endpoint: check player balance and status.
 */
export class WalletAPI {
  private opts: WalletAPIOptions;

  constructor(opts: WalletAPIOptions) {
    this.opts = opts;
  }

  /**
   * Get the current user's wallet info.
   *
   * GET /api/v1/wallet
   */
  async get(userId?: string): Promise<WalletResponse> {
    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/wallet`, {
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "X-Byok-User": userId ?? this.opts.defaultUserId ?? "",
      },
    });
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as WalletResponse;
  }
}
