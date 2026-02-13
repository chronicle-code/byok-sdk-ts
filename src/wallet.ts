import type { WalletResponse, CheckoutRequest, CheckoutResponse } from "./types.js";
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

  /**
   * Create a Stripe Checkout session for wallet top-up.
   * Returns a URL to open in a browser/webview for the player to complete payment.
   *
   * POST /api/v1/wallet/checkout
   */
  async checkout(request: CheckoutRequest, userId?: string): Promise<CheckoutResponse> {
    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/wallet/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "X-Byok-User": userId ?? this.opts.defaultUserId ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as CheckoutResponse;
  }
}
