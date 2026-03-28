const DEFAULT_CHIRP_MODEL = "chirp_3";
const DEFAULT_CHIRP_LOCATION = "global";
const DEFAULT_CHIRP_RECOGNIZER = "_";
const DEFAULT_CHIRP_LANGUAGE_CODES = ["en-US"];

const readRequired = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export type ScribeConfig = {
  chirp: {
    projectId: string;
    location: string;
    recognizer: string;
    model: string;
    languageCodes: string[];
  };
  fishjam: {
    fishjamId: string;
    managementToken: string;
    roomId: string;
    subscribeMode: "auto" | "manual";
  };
  phoenix: {
    wsUrl: string;
    topic: string;
    event: string;
  };
};

export const loadConfig = (): ScribeConfig => {
  const chirpProjectId =
    process.env.CHIRP_PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT;
  if (!chirpProjectId || chirpProjectId.trim().length === 0) {
    throw new Error(
      "Missing required environment variable: CHIRP_PROJECT_ID (or GOOGLE_CLOUD_PROJECT)",
    );
  }

  const phoenixWsUrl = readRequired("PHOENIX_WS_URL");
  const fishjamId = readRequired("FISHJAM_ID");
  const managementToken = readRequired("FISHJAM_MANAGEMENT_TOKEN");
  const roomId = readRequired("FISHJAM_ROOM_ID");

  const subscribeMode = process.env.FISHJAM_AGENT_SUBSCRIBE_MODE ?? "auto";
  if (subscribeMode !== "auto" && subscribeMode !== "manual") {
    throw new Error(
      "Environment variable FISHJAM_AGENT_SUBSCRIBE_MODE must be auto or manual",
    );
  }

  const rawLanguageCodes =
    process.env.CHIRP_LANGUAGE_CODES ?? DEFAULT_CHIRP_LANGUAGE_CODES.join(",");
  const languageCodes = rawLanguageCodes
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (languageCodes.length === 0) {
    throw new Error(
      "Environment variable CHIRP_LANGUAGE_CODES must contain at least one language code",
    );
  }

  return {
    chirp: {
      projectId: chirpProjectId,
      location: process.env.CHIRP_LOCATION ?? DEFAULT_CHIRP_LOCATION,
      recognizer: process.env.CHIRP_RECOGNIZER ?? DEFAULT_CHIRP_RECOGNIZER,
      model: process.env.CHIRP_MODEL ?? DEFAULT_CHIRP_MODEL,
      languageCodes,
    },
    fishjam: {
      fishjamId,
      managementToken,
      roomId,
      subscribeMode,
    },
    phoenix: {
      wsUrl: phoenixWsUrl,
      topic: process.env.PHOENIX_TOPIC ?? "scribe:global",
      event: process.env.PHOENIX_EVENT ?? "live_transcript",
    },
  };
};
