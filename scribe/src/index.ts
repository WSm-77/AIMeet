import { ChirpLiveClient } from "./chirp/ChirpLiveClient";
import { loadConfig } from "./config";
import { FishjamAgentPcmSource } from "./fishjam/FishjamAgentPcmSource";
import { PhoenixChannelClient } from "./phoenix/PhoenixChannelClient";
import type { TranscriptPayload } from "./types";

const run = async (): Promise<void> => {
  const config = loadConfig();
  const disablePcmStream = process.env.CHIRP_DISABLE_PCM_STREAM === "1";

  const fishjamAgent = new FishjamAgentPcmSource({
    fishjamId: config.fishjam.fishjamId,
    managementToken: config.fishjam.managementToken,
    roomId: config.fishjam.roomId,
    subscribeMode: config.fishjam.subscribeMode,
  });

  const phoenix = new PhoenixChannelClient({
    wsUrl: config.phoenix.wsUrl,
    topic: config.phoenix.topic,
  });

  const chirp = new ChirpLiveClient({
    projectId: config.chirp.projectId,
    location: config.chirp.location,
    recognizer: config.chirp.recognizer,
    model: config.chirp.model,
    languageCodes: config.chirp.languageCodes,
    onTranscript: (text, isFinal) => {
      const stage = isFinal ? "final" : "interim";
      console.log(`[Chirp ${stage}] ${text}`);

      const payload: TranscriptPayload = {
        text,
        isFinal,
        source: "chirp_3",
        roomId: config.fishjam.roomId,
        timestamp: new Date().toISOString(),
      };

      phoenix.broadcast(config.phoenix.event, payload);
    },
  });

  await fishjamAgent.start();
  // await phoenix.connect();
  await chirp.connect();

  if (!disablePcmStream) {
    const pcmStream = fishjamAgent.createPcmStream();
    void chirp.streamPcm(pcmStream).catch((error) => {
      console.error("Chirp PCM stream failed", error);
    });
  } else {
    console.warn("Chirp PCM streaming is disabled by CHIRP_DISABLE_PCM_STREAM=1");
  }

  console.debug("Scribe service started");
  console.debug("Chirp response mode: live transcript only");

  const shutdown = async (): Promise<void> => {
    console.warn("Shutting down Scribe service");
    chirp.close();
    phoenix.close();
    await fishjamAgent.stop();
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown();
  });
  process.once("SIGTERM", () => {
    void shutdown();
  });
};

void run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Could not load the default credentials")) {
    console.error(
      "Google ADC is not configured. Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON key, or run: gcloud auth application-default login",
    );
  }
  console.error("Failed to start Scribe service", error);
  process.exit(1);
});
