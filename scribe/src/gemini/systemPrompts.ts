import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const readPromptMarkdown = (relativePath: string): string => {
  const absolutePath = fileURLToPath(new URL(relativePath, import.meta.url));
  return readFileSync(absolutePath, "utf8").trim();
};

export const SCRIBE_SYSTEM_INSTRUCTION = readPromptMarkdown(
  "./prompts/scribe-system.md",
);

export const FACTCHECK_SYSTEM_INSTRUCTION = readPromptMarkdown(
  "./prompts/factcheck-system.md",
);
