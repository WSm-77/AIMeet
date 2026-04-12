export type InvitableAgentId = "scribe" | "factChecker";

export type InvitableAgentServiceId = "scribe" | "factChecker";

export type InvitableAgentServiceMetadata = {
  id: InvitableAgentServiceId;
  invitePath: string;
  unavailableLabel: string;
};

export type InvitableAgent = {
  id: InvitableAgentId;
  label: string;
  description: string;
  service: InvitableAgentServiceMetadata;
};

export const INVITABLE_AGENTS: InvitableAgent[] = [
  {
    id: "scribe",
    label: "Scribe",
    description: "Live notes and highlights during the call.",
    service: {
      id: "scribe",
      invitePath: "/sessions/join",
      unavailableLabel: "scribe",
    },
  },
  {
    id: "factChecker",
    label: "Fact Checker",
    description: "Verifies factual claims in real time.",
    service: {
      id: "factChecker",
      invitePath: "/sessions/join",
      unavailableLabel: "fact checker",
    },
  },
];

export const INVITABLE_AGENTS_BY_ID: Record<InvitableAgentId, InvitableAgent> = {
  scribe: INVITABLE_AGENTS[0],
  factChecker: INVITABLE_AGENTS[1],
};
