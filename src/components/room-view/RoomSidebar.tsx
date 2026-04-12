import { Button } from "@components/ui/button";

import { type AiNoteItem } from "./types";
import { ChatView } from "./ChatView";
import { AiNotesView } from "./AiNotesView";
import { CollaborativeNotesView } from "./CollaborativeNotesView";

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
    <aside className="space-y-4 lg:h-full lg:min-h-0 lg:self-stretch lg:pr-1">
      <section className="rounded-3xl border border-[#48474c]/35 bg-[#131317]/90 p-4 backdrop-blur-xl lg:flex lg:h-full lg:min-h-0 lg:flex-col">
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

        <div className="h-full min-h-0 lg:flex-1">
          {activeTab === "notes" && <CollaborativeNotesView />}
          {activeTab === "chat" && <ChatView />}
          {activeTab === "ai-notes" && (
            <AiNotesView aiNotesStatus={aiNotesStatus} aiNotes={aiNotes} />
          )}
        </div>
      </section>
    </aside>
  );
};
