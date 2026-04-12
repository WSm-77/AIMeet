import { ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import { AgentFeedCard } from "./AgentFeedCard";
import { getVerdictLabel, getVerdictTone } from "./factCheckUtils";
import { toTimeLabel } from "./useAiNotesFeed";
import { type FactCheckItem, type FeedConnectionStatus } from "./types";

type FactCheckViewProps = {
  factCheckStatus: FeedConnectionStatus;
  factCheckItems: FactCheckItem[];
};

export const FactCheckView = ({
  factCheckStatus,
  factCheckItems,
}: FactCheckViewProps) => {
  const statusText = useMemo(() => {
    if (factCheckStatus === "connected") return "Live fact-checking enabled";
    if (factCheckStatus === "connecting") {
      return "Connecting to fact-check stream...";
    }
    return "Disconnected from fact-check stream";
  }, [factCheckStatus]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2 text-[#b9ffd2]">
          <ShieldCheck size={16} />
          <h2 className="font-headline text-base">Fact Checker</h2>
        </div>

        <div className="mb-3 text-xs text-[#8b8990]">{statusText}</div>
      </section>

      <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        {factCheckItems.length === 0 ? (
          <p className="font-body text-sm text-[#acaab0]">
            Waiting for fact-check reports...
          </p>
        ) : (
          <div className="space-y-2 overflow-x-hidden overflow-y-auto text-sm lg:min-h-0 lg:flex-1">
            {factCheckItems.map((item) => {
              const verdictLabel = getVerdictLabel(item.verdict);
              const tone = getVerdictTone(item.verdict);

              return (
                <AgentFeedCard
                  key={item.id}
                  badge={verdictLabel}
                  badgeClassName={tone.badgeClassName}
                  timestampLabel={toTimeLabel(item.timestamp)}
                  text={item.text}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
