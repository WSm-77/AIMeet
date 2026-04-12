import { type FactCheckVerdict } from "./types";

const REFUTED_PATTERNS = [
  /\bfalse\b/i,
  /\bincorrect\b/i,
  /\bnot\s+true\b/i,
  /\bmisleading\b/i,
  /\brefuted\b/i,
  /\bunverified\b/i,
] as const;

const SUPPORTED_PATTERNS = [
  /\btrue\b/i,
  /\bcorrect\b/i,
  /\baccurate\b/i,
  /\bsupported\b/i,
  /\bverified\b/i,
  /\bconfirmed\b/i,
] as const;

export const inferFactCheckVerdict = (text: string): FactCheckVerdict => {
  if (REFUTED_PATTERNS.some((pattern) => pattern.test(text))) {
    return "refuted";
  }

  if (SUPPORTED_PATTERNS.some((pattern) => pattern.test(text))) {
    return "supported";
  }

  return "uncertain";
};

export const getVerdictLabel = (verdict: FactCheckVerdict): string => {
  if (verdict === "supported") return "Supported";
  if (verdict === "refuted") return "Refuted";
  return "Needs review";
};

export const getVerdictTone = (
  verdict: FactCheckVerdict,
): { badgeClassName: string; textClassName: string } => {
  if (verdict === "supported") {
    return {
      badgeClassName: "bg-emerald-500/20 text-emerald-200",
      textClassName: "text-emerald-300",
    };
  }

  if (verdict === "refuted") {
    return {
      badgeClassName: "bg-rose-500/20 text-rose-200",
      textClassName: "text-rose-300",
    };
  }

  return {
    badgeClassName: "bg-amber-500/20 text-amber-200",
    textClassName: "text-amber-300",
  };
};
