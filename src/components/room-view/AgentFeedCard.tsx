type AgentFeedCardProps = {
  badge: string;
  badgeClassName: string;
  timestampLabel: string;
  text: string;
};

export const AgentFeedCard = ({
  badge,
  badgeClassName,
  timestampLabel,
  text,
}: AgentFeedCardProps) => {
  return (
    <article className="rounded-xl bg-[#25252b] p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] ${badgeClassName}`}
        >
          {badge}
        </span>
        <span className="text-[11px] text-[#8b8990]">{timestampLabel}</span>
      </div>

      <p className="font-body whitespace-pre-wrap text-[#d6d4db]">{text}</p>
    </article>
  );
};
