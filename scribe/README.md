# Scribe Service

Server-side TypeScript service that joins FishJam as an Agent (using the server SDK),
streams incoming 16-bit 16kHz PCM audio to Google Speech-to-Text Chirp 3, and
broadcasts live transcripts to Phoenix.

## File Structure

- `scribe/src/index.ts`: service entrypoint and bridge orchestration
- `scribe/src/config.ts`: environment configuration
- `scribe/src/fishjam/FishjamAgentPcmSource.ts`: FishJam Agent connection and `trackData` PCM source
- `scribe/src/chirp/ChirpLiveClient.ts`: Chirp 3 streaming transcription client
- `scribe/src/phoenix/PhoenixChannelClient.ts`: Phoenix Channels publisher
- `scribe/src/types.ts`: shared transcript payload types

## Expected Environment Variables

- `CHIRP_PROJECT_ID`: Google Cloud project id (falls back to `GOOGLE_CLOUD_PROJECT`)
- `CHIRP_LOCATION`: defaults to `global` (region/location only, for example `europe-west3`)
- `CHIRP_RECOGNIZER`: recognizer id, defaults to `_` (can also be a full recognizer path)
- `CHIRP_MODEL`: defaults to `chirp_3`
- `CHIRP_LANGUAGE_CODES`: comma-separated BCP-47 language tags, defaults to `en-US`
- `FISHJAM_ID`: FishJam app id
- `FISHJAM_MANAGEMENT_TOKEN`: FishJam management token
- `FISHJAM_ROOM_ID`: room id where the agent should join
- `FISHJAM_AGENT_SUBSCRIBE_MODE`: `auto` (default) or `manual`
- `PHOENIX_WS_URL`: Phoenix socket URL, for example `ws://localhost:4000/socket/websocket`
- `PHOENIX_TOPIC`: defaults to `scribe:global`
- `PHOENIX_EVENT`: defaults to `live_transcript`

## Google Authentication

Google Speech-to-Text requires Application Default Credentials (ADC).

Use one of the following:

- Local development with gcloud:

```bash
gcloud auth application-default login
```

- Service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

If ADC is missing, startup fails with: `Could not load the default credentials`.

## Run

1. Start the service:

```bash
pnpm scribe:dev
```

The service follows the FishJam agent tutorial flow:

1. create/connect an agent in `FISHJAM_ROOM_ID`
2. receive audio via `trackData`
3. forward audio chunks to Chirp 3 streaming recognition
4. emit interim/final transcript events
5. broadcast transcript payloads over Phoenix Channels