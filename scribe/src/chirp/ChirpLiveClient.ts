import { v2 } from "@google-cloud/speech";

type ChirpLiveClientOptions = {
  projectId: string;
  location: string;
  recognizer: string;
  model: string;
  languageCodes: string[];
  onTranscript?: (text: string, isFinal: boolean) => void;
};

type StreamingResultAlternative = {
  transcript?: string;
};

type StreamingResult = {
  alternatives?: StreamingResultAlternative[];
  isFinal?: boolean;
};

type StreamingRecognizeResponse = {
  results?: StreamingResult[];
};

export class ChirpLiveClient {
  private readonly speechClient: v2.SpeechClient;
  private stream?: {
    write: (message: unknown) => boolean;
    end: () => void;
    on: (event: string, listener: (...args: unknown[]) => void) => void;
  };

  public constructor(private readonly options: ChirpLiveClientOptions) {
    this.speechClient = new v2.SpeechClient();
  }

  public async connect(): Promise<void> {
    const recognizer = this.resolveRecognizerName();

    try {
      await this.speechClient.initialize();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown authentication error";
      throw new Error(
        `Failed to initialize Google Speech client (${message}). Configure ADC with GOOGLE_APPLICATION_CREDENTIALS or run 'gcloud auth application-default login'.`,
      );
    }

    const stream = this.speechClient.streamingRecognize();

    stream.on("error", (error) => {
      console.error("Chirp live client error", error);
    });

    stream.on("data", (response) => {
      this.handleResponse(response as StreamingRecognizeResponse);
    });

    stream.on("end", () => {
      console.warn("Chirp streaming session ended");
    });

    stream.write({
      recognizer,
      streamingConfig: {
        config: {
          autoDecodingConfig: {},
          model: this.options.model,
          languageCodes: this.options.languageCodes,
          features: {
            enableAutomaticPunctuation: true,
          },
        },
        streamingFeatures: {
          interimResults: true,
        },
      },
    });

    this.stream = stream as typeof this.stream;
    console.debug(
      `Chirp live session opened (${this.options.location}/${this.options.model})`,
    );
  }

  public async streamPcm(source: AsyncIterable<Buffer>): Promise<void> {
    if (!this.stream) {
      throw new Error("Chirp live client is not connected");
    }

    for await (const pcmBuffer of source) {
      this.stream.write({ audio: pcmBuffer });
    }
  }

  public close(): void {
    this.stream?.end();
    this.stream = undefined;
    this.speechClient.close().catch((error) => {
      console.error("Failed to close Chirp speech client", error);
    });
  }

  private handleResponse(response: StreamingRecognizeResponse): void {
    const results = response.results ?? [];
    for (const result of results) {
      const transcript = result.alternatives?.[0]?.transcript;
      if (typeof transcript !== "string" || transcript.trim().length === 0) {
        continue;
      }
      this.options.onTranscript?.(transcript, result.isFinal === true);
    }
  }

  private resolveRecognizerName(): string {
    const recognizer = this.options.recognizer.trim();
    if (recognizer.includes("/recognizers/")) {
      return recognizer;
    }

    const location = this.options.location.trim();
    if (location.includes("/recognizers/")) {
      // Backward compatibility: CHIRP_LOCATION may be set to a full recognizer path.
      return location;
    }

    return this.speechClient.recognizerPath(
      this.options.projectId,
      location,
      recognizer,
    );
  }
}
