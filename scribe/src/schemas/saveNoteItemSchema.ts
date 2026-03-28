import { NOTE_ITEM_TYPES } from "../types";

export const saveNoteItemSchema = {
  type: "object",
  additionalProperties: false,
  required: ["content", "type"],
  properties: {
    content: {
      type: "string",
      description:
        "The note text extracted from the ongoing conversation or meeting audio.",
      minLength: 1,
    },
    type: {
      type: "string",
      enum: [...NOTE_ITEM_TYPES],
      description:
        "Semantic type for the note. Allowed values: action_item, decision, question, summary.",
    },
    assignee: {
      type: ["string", "null"],
      description:
        "Optional owner of the action item. Use null when no assignee is known.",
      default: null,
    },
  },
} as const;

export const saveNoteItemToolDeclaration = {
  name: "save_note_item",
  description:
    "Extract a note item from the meeting audio and send it to the application note feed.",
  parameters: saveNoteItemSchema,
} as const;
