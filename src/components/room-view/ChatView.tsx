import { MessageSquareText } from "lucide-react";

export const ChatView = () => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2 text-[#a8a4ff]">
          <MessageSquareText size={16} />
          <h2 className="font-headline text-base">Chat</h2>
        </div>

        <p className="text-xs text-[#8b8990]">Live discussion</p>
      </section>

      <section className="rounded-3xl border border-[#48474c]/35 bg-[#19191e]/90 p-4 backdrop-blur-xl lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="space-y-3 text-sm overflow-x-hidden overflow-y-auto lg:min-h-0 lg:flex-1">
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
    </div>
  );
};
