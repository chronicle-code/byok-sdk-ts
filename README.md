# @byok/sdk

TypeScript SDK for the [BYOK](https://byok.gg) API — AI-powered NPC interactions for games.

- Zero dependencies (native `fetch`)
- Full TypeScript types for every request and response
- Async iterators for streaming chat
- Works in Node.js (>=18) and browsers
- ESM + CommonJS dual output

## Install

```bash
npm install @byok/sdk
```

## Quickstart

```typescript
import { ByokClient } from "@byok/sdk";

const client = new ByokClient({
  apiKey: "byok_sk_...",
  defaultUserId: "player_123",
});

// Chat with an NPC
const response = await client.chat.create({
  messages: [{ role: "user", content: "What do you have for sale?" }],
  lorevaultEntityRef: "characters/blacksmith-thorn",
  qualityTier: "standard",
  gameState: { location: "market_square", gold: 150 },
});

console.log(response.choices[0].message.content);
```

## Streaming

```typescript
for await (const chunk of client.chat.stream({
  messages: [{ role: "user", content: "Tell me about the ancient ruins." }],
  lorevaultEntityRef: "characters/sage-miriel",
})) {
  if (!chunk.done) {
    process.stdout.write(chunk.content);
  }
}
```

## Player Registration

```typescript
const result = await client.players.register({
  steamId: "76561198000000000",
  displayName: "DragonSlayer42",
});

console.log(result.user_id); // UUID
console.log(result.created); // true if new account
```

## Game Events

```typescript
// Ingest a world event (deterministic processing, no AI cost)
await client.events.ingest({
  eventType: "world.discovery",
  payload: { location: "hidden_cave", discoverer: "player_123" },
});

// Poll for triggered events
const { events } = await client.events.poll({ since: "2025-01-01T00:00:00Z" });

// Acknowledge events
await client.events.ack(events[0].id);

// Or batch-acknowledge
await client.events.ackBatch(events.map((e) => e.id));
```

## Player State

```typescript
// Get current state
const state = await client.state.get();
// { markers_activated: [], location: null, custom: {} }

// Update state (markers merge additively, custom deep-merges)
await client.state.update({
  markers_activated: ["bridge_unlocked", "blacksmith_met"],
  location: "market_square",
  custom: { questLog: { mainQuest: "act_2" } },
});
```

## Player Intelligence

```typescript
// Behavioral profile for adaptive difficulty
const profile = await client.players.getProfile("player_123");
console.log(profile.dimensions.curiosity); // 0.85
console.log(profile.tags); // ["explorer", "diplomat"]

// Highlight reel — memorable NPC moments
const { highlights } = await client.players.getHighlights("player_123", {
  limit: 20,
});

// Spending intelligence — narrative-value breakdown
const spending = await client.players.getSpending("player_123");
```

## Wallet

```typescript
const wallet = await client.wallet.get();
console.log(`Balance: ${wallet.available_cents / 100} ${wallet.currency}`);
```

## Cross-Game Passport

```typescript
// Get a player's cross-game profile
const passport = await client.players.getPassport("user_uuid");
console.log(passport.game_count);
console.log(passport.profile);

// Grant passport sharing consent
await client.players.setPassportConsent({ consent: true });
```

## Error Handling

All API errors throw typed exceptions:

```typescript
import {
  ByokError,
  AuthenticationError,
  RateLimitError,
  PaymentRequiredError,
} from "@byok/sdk";

try {
  await client.chat.create({ messages: [{ role: "user", content: "Hi" }] });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof AuthenticationError) {
    console.log("Bad API key");
  } else if (err instanceof PaymentRequiredError) {
    console.log("Player needs to add funds at byok.gg");
  } else if (err instanceof ByokError) {
    console.log(`API error ${err.status}: ${err.message}`);
  }
}
```

### Error Classes

| Class | HTTP Status | When |
| --- | --- | --- |
| `AuthenticationError` | 401 | Invalid API key, missing user, invalid session |
| `PaymentRequiredError` | 402 | No wallet, insufficient balance, wallet frozen |
| `ForbiddenError` | 403 | Game not active, tier unavailable, no consent |
| `NotFoundError` | 404 | Entity/resource not found |
| `ValidationError` | 422 | Invalid request parameters |
| `RateLimitError` | 429 | Quota exceeded, spending limit, circuit breaker |
| `ProviderError` | 502 | Upstream AI provider failure |

## API Reference

### `ByokClient`

```typescript
new ByokClient({
  apiKey: string;          // Required. Your SDK API key.
  baseUrl?: string;        // Default: "https://byok.gg"
  defaultUserId?: string;  // Default X-Byok-User for all requests.
  fetch?: typeof fetch;    // Custom fetch (for testing or custom transports).
});
```

### Namespaces

| Namespace | Methods |
| --- | --- |
| `client.chat` | `create(req)`, `stream(req)` |
| `client.players` | `register(req)`, `getProfile(id)`, `getHighlights(id, params?)`, `getSpending(id)`, `getPassport(userId)`, `setPassportConsent(req)` |
| `client.events` | `poll(params?)`, `ack(id)`, `ackBatch(ids)`, `ingest(req)` |
| `client.state` | `get()`, `update(req)` |
| `client.wallet` | `get()` |

All methods accept an optional trailing `userId` parameter to override the client-level `defaultUserId` for that specific call.

## License

MIT
