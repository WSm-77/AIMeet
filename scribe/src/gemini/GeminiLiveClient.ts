import WebSocket from "ws";

import { saveNoteItemToolDeclaration } from "../schemas/saveNoteItemSchema";
import type { GeminiFunctionCall } from "../types";

const PCM_CHUNK_BYTES = 3200;
const PCM_MIME_TYPE = "audio/pcm;rate=16000";

type GeminiLiveClientOptions = {
  apiKey: string;
  wsUrl: string;
  model: string;
  onFunctionCall: (call: GeminiFunctionCall) => void;
};

type GeminiServerMessage = {
  serverContent?: {
    modelTurn?: {
      parts?: Array<Record<string, unknown>>;
    };
    toolCall?: {
      functionCalls?: Array<{ id?: string; name?: string; args?: unknown }>;
      functionCall?: { id?: string; name?: string; args?: unknown };
    };
  };
  toolCall?: {
    functionCalls?: Array<{ id?: string; name?: string; args?: unknown }>;
    functionCall?: { id?: string; name?: string; args?: unknown };
  };
};

export class GeminiLiveClient {
  private ws?: WebSocket;

  public constructor(private readonly options: GeminiLiveClientOptions) {}

  public async connect(): Promise<void> {
    const fullUrl = `${this.options.wsUrl}?key=${encodeURIComponent(this.options.apiKey)}`;

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(fullUrl);
      this.ws = ws;

      ws.on("open", () => {
        this.sendSetup();
        resolve();
      });

      ws.on("message", (data, isBinary) => {
        if (isBinary) return;
        this.handleMessage(data.toString());
      });

      ws.on("error", (error) => {
        reject(error);
      });

      ws.on("close", (code, reasonBuffer) => {
        const reason = reasonBuffer.toString("utf8");
        console.warn(`Gemini websocket closed (${code}) ${reason}`);
      });
    });
  }

  public async streamPcm(source: AsyncIterable<Buffer>): Promise<void> {
    for await (const pcmBuffer of source) {
      const chunks = this.chunkPcm(pcmBuffer, PCM_CHUNK_BYTES);
      for (const chunk of chunks) {
        this.sendRealtimeAudioChunk(chunk);
      }
    }
  }

  public close(): void {
    this.ws?.close(1000, "Scribe shutdown");
  }

  private sendSetup(): void {
    this.sendJson({
      setup: {
        model: this.options.model,
        generationConfig: {
          responseModalities: ["TEXT"],
        },
        tools: [
          {
            functionDeclarations: [saveNoteItemToolDeclaration],
          },
        ],
      },
    });
  }

  private sendRealtimeAudioChunk(chunk: Buffer): void {
    this.sendJson({
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: PCM_MIME_TYPE,
            data: chunk.toString("base64"),
          },
        ],
      },
    });
  }

  private sendJson(payload: unknown): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(payload));
  }

  private handleMessage(raw: string): void {
    let parsed: GeminiServerMessage;
    try {
      parsed = JSON.parse(raw) as GeminiServerMessage;
    } catch (_error) {
      return;
    }

    const functionCalls = this.extractFunctionCalls(parsed);
    for (const call of functionCalls) {
      if (call.name !== "save_note_item") continue;
      this.options.onFunctionCall(call);
    }
  }

  private extractFunctionCalls(
    message: GeminiServerMessage,
  ): GeminiFunctionCall[] {
    const calls: GeminiFunctionCall[] = [];

    const fromTopLevel = message.toolCall;
    if (fromTopLevel?.functionCalls) {
      calls.push(
        ...fromTopLevel.functionCalls.filter(this.isGeminiFunctionCall),
      );
    }
    if (
      fromTopLevel?.functionCall &&
      this.isGeminiFunctionCall(fromTopLevel.functionCall)
    ) {
      calls.push(fromTopLevel.functionCall);
    }

    const fromServerContent = message.serverContent?.toolCall;
    if (fromServerContent?.functionCalls) {
      calls.push(
        ...fromServerContent.functionCalls.filter(this.isGeminiFunctionCall),
      );
    }
    if (
      fromServerContent?.functionCall &&
      this.isGeminiFunctionCall(fromServerContent.functionCall)
    ) {
      calls.push(fromServerContent.functionCall);
    }

    const modelParts = message.serverContent?.modelTurn?.parts ?? [];
    for (const part of modelParts) {
      const maybeCall = part.functionCall;
      if (this.isGeminiFunctionCall(maybeCall)) {
        calls.push(maybeCall);
      }
    }

    return calls;
  }

  private chunkPcm(buffer: Buffer, chunkBytes: number): Buffer[] {
    if (buffer.length <= chunkBytes) return [buffer];

    const chunks: Buffer[] = [];
    for (let offset = 0; offset < buffer.length; offset += chunkBytes) {
      const end = Math.min(offset + chunkBytes, buffer.length);
      chunks.push(buffer.subarray(offset, end));
    }
    return chunks;
  }

  private isGeminiFunctionCall(value: unknown): value is GeminiFunctionCall {
    if (!value || typeof value !== "object") return false;
    const maybeCall = value as Record<string, unknown>;
    return typeof maybeCall.name === "string";
  }
}
