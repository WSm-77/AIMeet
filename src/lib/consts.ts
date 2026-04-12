import { type InvitableAgentServiceId } from "@/types/agents";

export const DEFAULT_FISHJAM_ID = import.meta.env.VITE_FISHJAM_ID ?? "";

export const SCRIBE_SERVICE_URL =
	import.meta.env.VITE_SCRIBE_SERVICE_URL ?? "http://localhost:8787";

export const FACT_CHECKER_SERVICE_URL =
	import.meta.env.VITE_FACT_CHECKER_SERVICE_URL ?? SCRIBE_SERVICE_URL;

export const INVITABLE_AGENT_SERVICE_URLS: Record<InvitableAgentServiceId, string> = {
	scribe: SCRIBE_SERVICE_URL,
	factChecker: FACT_CHECKER_SERVICE_URL,
};
