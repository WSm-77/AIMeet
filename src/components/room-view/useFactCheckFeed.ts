import { useEffect, useRef, useState } from "react";

import { FACT_CHECKER_SERVICE_URL } from "@/lib/consts";

import { inferFactCheckVerdict } from "./factCheckUtils";
import { type FactCheckItem, type FeedConnectionStatus } from "./types";

type FactCheckPayload = {
  type?: "fact_check_report";
  roomId?: string;
  text?: string;
  timestamp?: string;
};

const MAX_FACT_CHECK_ITEMS = 20;

const buildFactCheckWsUrl = (roomId: string | null): string => {
  const currentProtocol = typeof window !== "undefined" ? window.location.protocol : undefined;
  const useSameOriginPath = currentProtocol === "https:";

  const withRoomQuery = (path: string): string => {
    if (!roomId) return path;
    return `${path}${path.includes("?") ? "&" : "?"}roomId=${encodeURIComponent(roomId)}`;
  };

  if (useSameOriginPath) {
    return withRoomQuery("/ws/fact-check");
  }

  const explicitUrl = import.meta.env.VITE_FACT_CHECK_WS_URL;
  if (typeof explicitUrl === "string" && explicitUrl.trim().length > 0) {
    try {
      const parsed = new URL(explicitUrl.trim());
      if (roomId) {
        parsed.searchParams.set("roomId", roomId);
      } else {
        parsed.searchParams.delete("roomId");
      }
      return parsed.toString();
    } catch {
      return explicitUrl.trim();
    }
  }

  try {
    const serviceUrl = new URL(FACT_CHECKER_SERVICE_URL);
    serviceUrl.protocol = serviceUrl.protocol === "https:" ? "wss:" : "ws:";
    serviceUrl.pathname = "/ws/fact-check";
    if (roomId) {
      serviceUrl.searchParams.set("roomId", roomId);
    } else {
      serviceUrl.search = "";
    }
    serviceUrl.hash = "";
    return serviceUrl.toString();
  } catch {
    return withRoomQuery("/ws/fact-check");
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseFactCheckPayload = (value: unknown): FactCheckPayload | null => {
  if (!isRecord(value)) return null;

  const type = value.type;
  const text = value.text;
  const roomId = value.roomId;
  const timestamp = value.timestamp;

  if (type !== "fact_check_report") return null;
  if (typeof text !== "string" || text.trim().length === 0) return null;

  return {
    type,
    text,
    roomId: typeof roomId === "string" ? roomId : undefined,
    timestamp: typeof timestamp === "string" ? timestamp : undefined,
  };
};

const getFactCheckFingerprint = ({
  roomId,
  text,
  timestamp,
}: {
  roomId?: string;
  text: string;
  timestamp: string;
}): string => `${roomId ?? ""}|${timestamp}|${text}`;

export const useFactCheckFeed = (roomId: string | null, enabled = true) => {
  const [factCheckItems, setFactCheckItems] = useState<FactCheckItem[]>([]);
  const [factCheckStatus, setFactCheckStatus] =
    useState<FeedConnectionStatus>(enabled ? "connecting" : "disconnected");
  const seenFactChecksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      setFactCheckStatus("disconnected");
      return;
    }

    let isDisposed = false;
    let isIntentionalClose = false;
    let socket: WebSocket | undefined;
    let reconnectTimer: number | undefined;
    let reconnectAttempt = 0;

    const connect = () => {
      if (isDisposed) return;

      isIntentionalClose = false;
      setFactCheckStatus("connecting");
      const factCheckWsUrl = buildFactCheckWsUrl(roomId);
      socket = new WebSocket(factCheckWsUrl);

      socket.onopen = () => {
        reconnectAttempt = 0;
        setFactCheckStatus("connected");
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data as string) as unknown;
          const payload = parseFactCheckPayload(parsed);

          if (!payload) return;
          if (roomId && payload.roomId && payload.roomId !== roomId) return;

          const text = payload.text?.trim();
          if (!text) return;

          const timestamp = payload.timestamp ?? new Date().toISOString();
          const fingerprint = getFactCheckFingerprint({
            roomId: payload.roomId,
            text,
            timestamp,
          });

          if (seenFactChecksRef.current.has(fingerprint)) return;
          seenFactChecksRef.current.add(fingerprint);

          setFactCheckItems((current) => {
            const next = [
              {
                id: crypto.randomUUID(),
                text,
                timestamp,
                verdict: inferFactCheckVerdict(text),
              },
              ...current,
            ].slice(0, MAX_FACT_CHECK_ITEMS);

            if (seenFactChecksRef.current.size > 300) {
              seenFactChecksRef.current = new Set(
                next.map((item) =>
                  getFactCheckFingerprint({
                    roomId: roomId ?? undefined,
                    text: item.text,
                    timestamp: item.timestamp,
                  }),
                ),
              );
            }

            return next;
          });
        } catch {
          // Ignore malformed websocket payloads.
        }
      };

      socket.onerror = () => {
        if (isDisposed || isIntentionalClose) return;
        setFactCheckStatus("disconnected");
      };

      socket.onclose = () => {
        if (isDisposed || isIntentionalClose) return;

        setFactCheckStatus("disconnected");

        const reconnectDelayMs = reconnectAttempt === 0 ? 2_000 : 10_000;
        reconnectAttempt += 1;

        reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
      };
    };

    connect();

    return () => {
      isDisposed = true;

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }

      if (socket) {
        isIntentionalClose = true;
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (
          socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN
        ) {
          socket.close(1000, "Room view unmounted");
        }
      }
    };
  }, [enabled, roomId]);

  return { factCheckItems, factCheckStatus };
};
