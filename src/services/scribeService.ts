import { INVITABLE_AGENT_SERVICE_URLS } from "@/lib/consts";
import {
  INVITABLE_AGENTS_BY_ID,
  type InvitableAgent,
  type InvitableAgentId,
} from "@/types/agents";

const normalizeServiceUrl = (serviceUrl: string): string =>
  serviceUrl.endsWith("/") ? serviceUrl.slice(0, -1) : serviceUrl;

const buildAgentInviteUrl = (agent: InvitableAgent): string => {
  const serviceBaseUrl = normalizeServiceUrl(INVITABLE_AGENT_SERVICE_URLS[agent.service.id]);
  return `${serviceBaseUrl}${agent.service.invitePath}`;
};

export class ScribeServiceUnavailableError extends Error {
  public constructor(message = "Local scribe service is unavailable") {
    super(message);
    this.name = "ScribeServiceUnavailableError";
  }
}

const createUnavailableError = (
  unavailableLabel: string,
  reason?: string,
): ScribeServiceUnavailableError => {
  const suffix = reason ? ` (${reason})` : "";
  return new ScribeServiceUnavailableError(
    `Local ${unavailableLabel} service is unavailable${suffix}`,
  );
};

const parseErrorDetails = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "";
  } catch {
    return "";
  }
};

const joinAgentSession = async (agent: InvitableAgent, roomId?: string): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(buildAgentInviteUrl(agent), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomId ? { room_id: roomId } : {}),
    });
  } catch {
    throw createUnavailableError(agent.service.unavailableLabel, "could not reach control API");
  }

  if (response.ok) return;

  if (response.status >= 500) {
    throw createUnavailableError(agent.service.unavailableLabel, `status ${response.status}`);
  }

  const details = await parseErrorDetails(response);

  const suffix = details ? `: ${details}` : "";
  throw new Error(
    `Failed to start ${agent.label.toLowerCase()} session (status ${response.status})${suffix}`,
  );
};

export const joinScribeSession = async (roomId?: string): Promise<void> => {
  await joinAgentSession(INVITABLE_AGENTS_BY_ID.scribe, roomId);
};

export const inviteAgents = async (
  selectedAgentIds: InvitableAgentId[],
  roomId?: string,
): Promise<InvitableAgentId[]> => {
  const uniqueSelected = Array.from(new Set(selectedAgentIds));
  if (uniqueSelected.length === 0) return [];

  for (const agentId of uniqueSelected) {
    await joinAgentSession(INVITABLE_AGENTS_BY_ID[agentId], roomId);
  }

  return uniqueSelected;
};
