import { Sparkles } from "lucide-react";
import { useMemo } from "react";

import { AgentFeedCard } from "./AgentFeedCard";
import { toTimeLabel } from "./useAiNotesFeed";
import { type AiNoteItem, type FeedConnectionStatus } from "./types";

type AiNotesViewProps = {
  aiNotesStatus: FeedConnectionStatus;
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
                <AgentFeedCard
                  key={note.id}
                  badge="AI update"
                  badgeClassName="bg-[#2c2d34] text-[#8ff5ff]"
                  timestampLabel={toTimeLabel(note.timestamp)}
                  text={note.text}
                />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
