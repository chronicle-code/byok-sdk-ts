import type {
  PollEventsParams,
  PollEventsResponse,
  AcknowledgeResponse,
  AcknowledgeBatchResponse,
  IngestEventRequest,
  IngestEventResponse,
} from "./types.js";
import { throwForStatus } from "./errors.js";

export interface EventsAPIOptions {
  baseUrl: string;
  apiKey: string;
  defaultUserId?: string;
  fetch: typeof globalThis.fetch;
}

/**
 * Game events: poll for notifications, acknowledge, and ingest world events.
 */
export class EventsAPI {
  private opts: EventsAPIOptions;

  constructor(opts: EventsAPIOptions) {
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
   * Poll for unacknowledged game events (milestones, triggers, etc.)
   *
   * GET /api/v1/events
   */
  async poll(params?: PollEventsParams, userId?: string): Promise<PollEventsResponse> {
    const url = new URL(`${this.opts.baseUrl}/api/v1/events`);
    if (params?.since) url.searchParams.set("since", params.since);

    const response = await this.opts.fetch(url.toString(), {
      headers: this.authHeaders(userId),
    });
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as PollEventsResponse;
  }

  /**
   * Acknowledge a single event so it won't be returned again.
   *
   * POST /api/v1/events/:id/ack
   */
  async ack(eventId: string, userId?: string): Promise<AcknowledgeResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/events/${encodeURIComponent(eventId)}/ack`,
      {
        method: "POST",
        headers: this.authHeaders(userId),
      }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as AcknowledgeResponse;
  }

  /**
   * Batch-acknowledge multiple events at once.
   *
   * POST /api/v1/events/ack
   */
  async ackBatch(eventIds: string[], userId?: string): Promise<AcknowledgeBatchResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/events/ack`,
      {
        method: "POST",
        headers: this.authHeaders(userId),
        body: JSON.stringify({ event_ids: eventIds }),
      }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as AcknowledgeBatchResponse;
  }

  /**
   * Ingest a game world event for deterministic processing (no AI cost).
   *
   * POST /api/v1/events/ingest
   */
  async ingest(request: IngestEventRequest, userId?: string): Promise<IngestEventResponse> {
    const response = await this.opts.fetch(
      `${this.opts.baseUrl}/api/v1/events/ingest`,
      {
        method: "POST",
        headers: this.authHeaders(userId),
        body: JSON.stringify({
          event_type: request.eventType,
          payload: request.payload,
        }),
      }
    );
    if (!response.ok) await throwForStatus(response);
    return (await response.json()) as IngestEventResponse;
  }
}
