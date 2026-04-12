import { Edit3, MessageSquareText, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { InteractiveNotes } from "@components/InteractiveNotes";
import { Button } from "@components/ui/button";

import { toTimeLabel } from "./useAiNotesFeed";
import { type AiNoteItem } from "./types";

export type RoomSidebarTab = "notes" | "chat" | "ai-notes";

type RoomSidebarProps = {
  isOpen: boolean;
  aiNotesStatus: "connecting" | "connected" | "disconnected";
  aiNotes: AiNoteItem[];
  activeTab: RoomSidebarTab;
  onTabChange: (tab: RoomSidebarTab) => void;
};

const tabButtonClass =
  "h-9 rounded-full border px-3 text-xs font-medium shadow-none transition-colors";

const notesTabs: Array<{ id: RoomSidebarTab; label: string }> = [
  { id: "notes", label: "Collaborative Notes" },
  { id: "chat", label: "Chat" },
  { id: "ai-notes", label: "AI Notes" },
];

const ChatView = () => {
  return (
    <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-[#a8a4ff]">
        <MessageSquareText size={16} />
        <h2 className="font-headline text-base">Chat</h2>
      </div>

      <div className="space-y-3 text-sm">
        <article className="rounded-xl bg-[#25252b] p-3">
          <p className="font-body text-[#fcf8fe]">
            Elena R. <span className="text-[#acaab0]">10:42 AM</span>
          </p>
          <p className="font-body text-[#acaab0]">
            The new motion guidelines look incredible. Can we review
            transition curves?
          </p>
        </article>
        <article className="rounded-xl bg-[#25252b] p-3">
          <p className="font-body text-[#fcf8fe]">
            Marcus T. <span className="text-[#acaab0]">10:45 AM</span>
          </p>
          <p className="font-body text-[#acaab0]">
            Uploaded the latest deck. We should align the ROI narrative
            before client Q&A.
          </p>
        </article>
      </div>
    </section>
  );
};

const AiNotesView = ({ aiNotesStatus, aiNotes }: Pick<RoomSidebarProps, "aiNotesStatus" | "aiNotes">) => {
  const statusText = useMemo(() => {
    if (aiNotesStatus === "connected") return "Live sync enabled";
    if (aiNotesStatus === "connecting") return "Connecting to notes stream...";
    return "Disconnected from notes stream";
  }, [aiNotesStatus]);

  return (
    <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-[#8ff5ff]">
        <Sparkles size={16} />
        <h2 className="font-headline text-base">AI Notes</h2>
      </div>

      <div className="mb-3 text-xs text-[#8b8990]">{statusText}</div>

      {aiNotes.length === 0 ? (
        <p className="font-body text-sm text-[#acaab0]">
          Waiting for AI notes from scribe...
        </p>
      ) : (
        <div className="space-y-2 text-sm">
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
  );
};

const CollaborativeNotesView = () => {
  return (
    <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-[#ffd6a8]">
        <Edit3 size={16} />
        <h2 className="font-headline text-base">Collaborative Notes</h2>
      </div>

      <InteractiveNotes />
    </section>
  );
};

export const RoomSidebar = ({
  isOpen,
  aiNotesStatus,
  aiNotes,
  activeTab,
  onTabChange,
}: RoomSidebarProps) => {
  if (!isOpen) return null;

  const activeTabClass =
    "border-[#a8a4ff]/55 bg-[#3e1bff]/20 text-[#fcf8fe]";
  const inactiveTabClass = "border-[#48474c]/35 bg-[#25252b]/80 text-[#acaab0]";

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <section className="rounded-3xl border border-[#48474c]/35 bg-[#131317]/90 p-4 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap gap-2">
          {notesTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                className={`${tabButtonClass} ${isActive ? activeTabClass : inactiveTabClass}`}
                onClick={() => onTabChange(tab.id)}
                type="button"
                variant="ghost"
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {activeTab === "notes" && <CollaborativeNotesView />}
        {activeTab === "chat" && <ChatView />}
        {activeTab === "ai-notes" && (
          <AiNotesView aiNotesStatus={aiNotesStatus} aiNotes={aiNotes} />
        )}
      </section>
    </aside>
  );
};
