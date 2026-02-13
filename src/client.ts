import type { ByokClientConfig } from "./types.js";
import { ChatAPI } from "./chat.js";
import { PlayersAPI } from "./players.js";
import { EventsAPI } from "./events.js";
import { StateAPI } from "./state.js";
import { WalletAPI } from "./wallet.js";

const DEFAULT_BASE_URL = "https://byok.gg";

/**
 * BYOK SDK client. Entry point for all API interactions.
 *
 * ```ts
 * const client = new ByokClient({
 *   apiKey: "byok_sk_...",
 *   defaultUserId: "player_123",
 * });
 * ```
 */
export class ByokClient {
  /** Chat completions (sync and streaming) */
  readonly chat: ChatAPI;
  /** Player registration, profiles, highlights, spending, passport */
  readonly players: PlayersAPI;
  /** Game event polling, acknowledgement, and world event ingest */
  readonly events: EventsAPI;
  /** Per-player persistent state (markers, location, custom data) */
  readonly state: StateAPI;
  /** Player wallet balance and status */
  readonly wallet: WalletAPI;

  constructor(config: ByokClientConfig) {
    const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    const fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);

    const shared = {
      baseUrl,
      apiKey: config.apiKey,
      defaultUserId: config.defaultUserId,
      fetch: fetchFn,
    };

    this.chat = new ChatAPI(shared);
    this.players = new PlayersAPI(shared);
    this.events = new EventsAPI(shared);
    this.state = new StateAPI(shared);
    this.wallet = new WalletAPI(shared);
  }
}
