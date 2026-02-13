import type {
  RegisterPlayerRequest,
  RegisterPlayerResponse,
  PlayerProfileResponse,
  HighlightParams,
  HighlightReelResponse,
  SpendingIntelligenceResponse,
  PassportResponse,
  PassportConsentRequest,
  PassportConsentResponse,
  RegisterPlayerSteam,
  RegisterPlayerDevice,
  RegisterPlayerExternal,
} from "./types.js";
import { throwForStatus } from "./errors.js";

export interface PlayersAPIOptions {
  baseUrl: string;
  apiKey: string;
  defaultUserId?: string;
  fetch: typeof globalThis.fetch;
}

/**
 * Player endpoints: registration, profiles, highlights, spending, passport.
 */
export class PlayersAPI {
  private opts: PlayersAPIOptions;

  constructor(opts: PlayersAPIOptions) {
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
   * Register a player. Supports three auth methods:
   * - Steam ID: `{ steamId: "76561198..." }`
   * - Device ID: `{ deviceId: "550e8400-..." }`
   * - External auth: `{ externalId: "player_123", externalProvider: "my_auth" }`
   *
   * Returns the user_id and whether a new account was created.
   *
   * POST /api/v1/users/register
   */
  async register(request: RegisterPlayerRequest): Promise<RegisterPlayerResponse> {
    const body: Record<string, string> = {};

    if ("steamId" in request) {
      body.steam_id = (request as RegisterPlayerSteam).steamId;
    } else if ("deviceId" in request) {
      body.device_id = (request as RegisterPlayerDevice).deviceId;
    } else if ("externalId" in request) {
      body.external_id = (request as RegisterPlayerExternal).externalId;
      body.external_provider = (request as RegisterPlayerExternal).externalProvider;
    }

    if (request.displayName) body.display_name = request.displayName;

    const response = await this.opts.fetch(`${this.opts.baseUrl}/api/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.opts.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as RegisterPlayerResponse;
  }

  /**
   * Get a player's behavioral profile for adaptive difficulty.
   *
   * GET /api/v1/players/:id/profile
   */
  async getProfile(playerId: string, userId?: string): Promise<PlayerProfileResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/players/${encodeURIComponent(playerId)}/profile`,
      { headers: this.authHeaders(userId) }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as PlayerProfileResponse;
  }

  /**
   * Get a player's highlight reel — memorable NPC moments.
   *
   * GET /api/v1/players/:id/highlights
   */
  async getHighlights(
    playerId: string,
    params?: HighlightParams,
    userId?: string
  ): Promise<HighlightReelResponse> {
    const url = new URL(
      `${this.opts.baseUrl}/api/v1/players/${encodeURIComponent(playerId)}/highlights`
    );
    if (params?.limit != null) url.searchParams.set("limit", String(params.limit));
    if (params?.since) url.searchParams.set("since", params.since);

    const response = await this.opts.fetch(url.toString(), {
      headers: this.authHeaders(userId),
    });
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as HighlightReelResponse;
  }

  /**
   * Get a player's spending intelligence — narrative-value breakdown.
   *
   * GET /api/v1/players/:id/spending
   */
  async getSpending(
    playerId: string,
    userId?: string
  ): Promise<SpendingIntelligenceResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/players/${encodeURIComponent(playerId)}/spending`,
      { headers: this.authHeaders(userId) }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as SpendingIntelligenceResponse;
  }

  /**
   * Get a player's cross-game passport.
   *
   * GET /api/v1/passport/:user_id
   */
  async getPassport(targetUserId: string, userId?: string): Promise<PassportResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/passport/${encodeURIComponent(targetUserId)}`,
      { headers: this.authHeaders(userId) }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as PassportResponse;
  }

  /**
   * Grant or revoke cross-game passport sharing consent.
   *
   * POST /api/v1/passport/consent
   */
  async setPassportConsent(
    request: PassportConsentRequest,
    userId?: string
  ): Promise<PassportConsentResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/passport/consent`,
      {
        method: "POST",
        headers: this.authHeaders(userId),
        body: JSON.stringify({ consent: request.consent }),
      }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as PassportConsentResponse;
  }
}
