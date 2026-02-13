// Main client
export { ByokClient } from "./client.js";

// Namespace APIs (for advanced usage / type access)
export { ChatAPI } from "./chat.js";
export { PlayersAPI } from "./players.js";
export { EventsAPI } from "./events.js";
export { StateAPI } from "./state.js";
export { WalletAPI } from "./wallet.js";

// SSE stream parser
export { parseSSEStream } from "./streaming.js";

// Errors
export {
  ByokError,
  AuthenticationError,
  PaymentRequiredError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ProviderError,
} from "./errors.js";

// Types
export type {
  ByokClientConfig,
  QualityTier,
  ChatMessage,
  ChatRequest,
  ChatChoice,
  ChatUsage,
  ChatResponse,
  ChatStreamChunk,
  RegisterPlayerSteam,
  RegisterPlayerDevice,
  RegisterPlayerExternal,
  RegisterPlayerRequest,
  RegisterPlayerResponse,
  GameEvent,
  PollEventsParams,
  PollEventsResponse,
  AcknowledgeResponse,
  AcknowledgeBatchResponse,
  EventType,
  IngestEventRequest,
  IngestEventResponse,
  PlayerState,
  UpdateStateRequest,
  WalletResponse,
  PlayerProfileDimensions,
  PlayerProfileResponse,
  HighlightParams,
  HighlightReelResponse,
  SpendingIntelligenceResponse,
  PassportResponse,
  PassportConsentRequest,
  PassportConsentResponse,
  ByokErrorBody,
} from "./types.js";
