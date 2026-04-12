import { Sparkles } from "lucide-react";
import { useMemo } from "react";

import { toTimeLabel } from "./useAiNotesFeed";
import { type AiNoteItem } from "./types";

type AiNotesViewProps = {
  aiNotesStatus: "connecting" | "connected" | "disconnected";
  aiNotes: AiNoteItem[];
};

export const AiNotesView = ({
  aiNotesStatus,
  aiNotes,
}: AiNotesViewProps) => {
  const statusText = useMemo(() => {
    if (aiNotesStatus === "connected") return "Live sync enabled";
    if (aiNotesStatus === "connecting") return "Connecting to notes stream...";
    return "Disconnected from notes stream";
  }, [aiNotesStatus]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">

      <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2 text-[#8ff5ff]">
          <Sparkles size={16} />
          <h2 className="font-headline text-base">AI Notes</h2>
        </div>

        <div className="mb-3 text-xs text-[#8b8990]">{statusText}</div>
      </section>

      <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        {aiNotes.length === 0 ? (
          <p className="font-body text-sm text-[#acaab0]">
            Waiting for AI notes from scribe...
          </p>
        ) : (
          <div className="space-y-2 overflow-x-hidden overflow-y-auto text-sm lg:min-h-0 lg:flex-1">
            {aiNotes.map((note) => (
              <article key={note.id} className="rounded-xl bg-[#25252b] p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#2c2d34] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#8ff5ff]">
                    AI update
                  </span>
                  <span className="text-[11px] text-[#8b8990]">
                    {toTimeLabel(note.timestamp)}
                  </span>
                </div>

                <p className="font-body whitespace-pre-wrap text-[#d6d4db]">
                  {note.text}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
