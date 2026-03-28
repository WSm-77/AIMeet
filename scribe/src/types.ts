export const NOTE_ITEM_TYPES = [
  "action_item",
  "decision",
  "question",
  "summary",
] as const;

export type NoteItemType = (typeof NOTE_ITEM_TYPES)[number];

export type SaveNoteItemArgs = {
  content: string;
  type: NoteItemType;
  assignee: string | null;
};

export type SaveNoteItemPayload = SaveNoteItemArgs & {
  source: "gemini_live";
  roomId?: string;
  callId?: string;
  timestamp: string;
};

export type GeminiFunctionCall = {
  id?: string;
  name: string;
  args?: unknown;
};
