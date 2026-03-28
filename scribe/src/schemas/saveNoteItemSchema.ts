import { NOTE_ITEM_TYPES } from "../types";

export const saveNoteItemSchema = {
  type: "object",
  required: ["content", "type"],
  properties: {
    content: {
      type: "string",
      description:
        "The note text extracted from the ongoing conversation or meeting audio.",
    },
    type: {
      type: "string",
      enum: [...NOTE_ITEM_TYPES],
      description:
        "Semantic type for the note. Allowed values: action_item, decision, question, summary.",
    },
    assignee: {
      type: "string",
      description:
        "Optional owner of the action item. Omit when no assignee is known.",
    },
  },
} as const;

export const saveNoteItemToolDeclaration = {
  name: "save_note_item",
  description:
    "Extract a note item from the meeting audio and send it to the application note feed.",
  parameters: saveNoteItemSchema,
} as const;
