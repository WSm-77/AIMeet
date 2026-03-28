# Fishjam Chat

A modern conferencing frontend built with React, Vite, Tailwind, and
`@fishjam-cloud/react-client`.

This project includes:

- room join and role selection flow,
- camera/microphone controls,
- screen sharing layout (spotlight + top bar pagination),
- side panel (user notes, AI notes),
- optional real-time background blur using MediaPipe + Web Worker.

## Requirements

- Node.js 20+
- npm or pnpm
- a Fishjam room manager backend and project credentials

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Set your Fishjam project ID in `.env`:

```bash
VITE_FISHJAM_ID=your_fishjam_id
```

4. Run locally:

```bash
npm run dev
```

5. Open the URL printed by Vite (usually `http://localhost:5173`).

## Scripts

- `npm run dev` - start local development server
- `npm run build` - type-check and create production build
- `npm run preview` - preview production build locally
- `npm run lint` - lint and auto-fix
- `npm run lint:check` - lint in check-only mode
- `npm run format` - format code with Prettier
- `npm run format:check` - verify formatting

## Project structure

```text
src/
	components/      UI and call experience components
	context/         room/session context providers
	lib/             constants, room manager helpers, utility helpers
	utils/blur/      MediaPipe blur processor + worker implementation
public/shaders/    GLSL shader files used by blur renderer
```

## Environment variables

- `VITE_FISHJAM_ID` - required Fishjam project ID

See `.env.example` for defaults and optional variables.

## Notes on background blur

Background blur relies on:

- `@mediapipe/tasks-vision` for segmentation,
- a dedicated worker (`src/utils/blur/BlurProcessorWorker.ts`) to keep UI smooth,
- shader files from `public/shaders/blur`.

If blur is not working, verify that static assets from `public/` are served correctly
and your browser supports required Web APIs.

## Troubleshooting

- Blank room or connection issues:
	- verify `.env` values,
	- verify your room manager backend URL/configuration,
	- check browser console/network tab for Fishjam API errors.
- Devices not available:
	- ensure camera/mic permissions are granted,
	- use HTTPS when required by browser policy.

## References

- Fishjam React quick start:
	https://fishjam.swmansion.com/docs/0.24.0/tutorials/react-quick-start
- Smelter getting started:
	https://smelter.dev/fundamentals/getting-started
