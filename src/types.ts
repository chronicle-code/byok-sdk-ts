// ── Client configuration ──

export interface ByokClientConfig {
  /** SDK API key (e.g. "byok_sk_...") */
  apiKey: string;
  /** Base URL of the BYOK API. Defaults to "https://byok.gg" */
  baseUrl?: string;
  /** Default user ID sent via X-Byok-User header */
  defaultUserId?: string;
  /** Custom fetch implementation (defaults to globalThis.fetch) */
  fetch?: typeof globalThis.fetch;
}

// ── Chat ──

export type QualityTier = "budget" | "standard" | "ultra";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  /** Message history. Typically a single user message or a conversation array. */
  messages: ChatMessage[];
  /** AI quality tier. Defaults to "standard". */
  qualityTier?: QualityTier;
  /** Enable SSE streaming response. */
  stream?: boolean;
  /** LoreVault entity reference, e.g. "characters/blacksmith-thorn" */
  lorevaultEntityRef?: string;
  /** Arbitrary game state passed as context to the AI */
  gameState?: Record<string, unknown>;
  /** Player/user ID. Overrides the client-level defaultUserId for this request. */
  userId?: string;
  /** Worker session token (for LoreVault worker sessions) */
  sessionToken?: string;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  id: string;
  object: "chat.completion";
  model: string;
  choices: ChatChoice[];
  usage: ChatUsage;
}

export interface ChatStreamChunk {
  /** The text content delta for this chunk */
  content: string;
  /** Set to true on the final chunk */
  done: boolean;
}

// ── Player Registration ──

/**
 * Register via Steam ID.
 */
export interface RegisterPlayerSteam {
  /** Steam ID string (e.g. "76561198...") */
  steamId: string;
  /** Display name. Defaults to "Steam User" on the server. */
  displayName?: string;
}

/**
 * Register via anonymous device UUID.
 */
export interface RegisterPlayerDevice {
  /** Anonymous/device UUID (e.g. "550e8400-...") */
  deviceId: string;
  /** Display name. Defaults to "Player" on the server. */
  displayName?: string;
}

/**
 * Register via custom external auth provider.
 */
export interface RegisterPlayerExternal {
  /** External user ID from your auth system (e.g. "player_123") */
  externalId: string;
  /** Provider name (e.g. "my_auth", "epic", "custom") */
  externalProvider: string;
  /** Display name. Defaults to "Player" on the server. */
  displayName?: string;
}

/**
 * Player registration request. Provide exactly one auth method:
 * - `steamId` for Steam authentication
 * - `deviceId` for anonymous/device-based auth
 * - `externalId` + `externalProvider` for custom auth systems
 */
export type RegisterPlayerRequest =
  | RegisterPlayerSteam
  | RegisterPlayerDevice
  | RegisterPlayerExternal;

export interface RegisterPlayerResponse {
  user_id: string;
  created: boolean;
}

// ── Events (polling) ──

export interface GameEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface PollEventsParams {
  /** Only return events after this ISO 8601 timestamp */
  since?: string;
}

export interface PollEventsResponse {
  events: GameEvent[];
}

export interface AcknowledgeResponse {
  acknowledged: true;
}

export interface AcknowledgeBatchResponse {
  acknowledged: number;
}

// ── Event Ingest ──

export type EventType =
  | "world.kill"
  | "world.discovery"
  | "world.quest_complete"
  | "world.area_enter"
  | "world.item_transfer"
  | "world.custom"
  | (string & {});

export interface IngestEventRequest {
  /** Event type (e.g. "world.kill", "world.discovery") */
  eventType: EventType;
  /** Event-specific payload */
  payload: Record<string, unknown>;
}

export interface IngestEventResponse {
  processed: unknown[];
  event_type: string;
  effects_count: number;
}

// ── Player State ──

export interface PlayerState {
  markers_activated: string[];
  location: string | null;
  custom: Record<string, unknown>;
}

export interface UpdateStateRequest {
  /** Markers to add (merged additively) */
  markers_activated?: string[];
  /** Current player location */
  location?: string | null;
  /** Custom key-value data (deep-merged) */
  custom?: Record<string, unknown>;
}

// ── Wallet ──

export interface WalletResponse {
  id: string;
  balance_cents: number;
  held_cents: number;
  available_cents: number;
  currency: string;
  status: string;
  quality_preference: string | null;
}

// ── Player Profile ──

export interface PlayerProfileDimensions {
  diplomacy_vs_aggression: number;
  curiosity: number;
  morality: number;
}

export interface PlayerProfileResponse {
  player_id: string;
  game_id: string;
  dimensions: PlayerProfileDimensions;
  tags: string[];
  total_interactions: number;
  social_investment: number;
  updated_at: string;
}

// ── Highlight Reel ──

export interface HighlightParams {
  /** Max number of highlights (server default: 50, max: 200) */
  limit?: number;
  /** Only return highlights after this ISO 8601 timestamp */
  since?: string;
}

export interface HighlightReelResponse {
  highlights: unknown[];
}

// ── Spending Intelligence ──

export interface SpendingIntelligenceResponse {
  [key: string]: unknown;
}

// ── Player Passport ──

export interface PassportResponse {
  player_id: string;
  profile: Record<string, unknown>;
  game_count: number;
  total_interactions: number;
  last_computed_at: string;
}

export interface PassportConsentRequest {
  consent: boolean;
}

export interface PassportConsentResponse {
  consent_granted: boolean;
  player_id: string;
}

// ── Error shape ──

export interface ByokErrorBody {
  error: {
    message: string;
    type?: string;
    code?: string;
    details?: unknown;
  };
}
