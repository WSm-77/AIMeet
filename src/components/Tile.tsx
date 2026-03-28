import { type PeerId, type Track, useVAD } from "@fishjam-cloud/react-client";

import { cn } from "@/lib/utils";

import AudioPlayer from "./AudioPlayer";
import { Badge } from "./ui/badge";
import VideoPlayer from "./VideoPlayer";

type Props = {
  id: PeerId;
  name: string;
  videoTrack?: Track;
  audioTrack?: Track;
  isLocal?: boolean;
  className?: string;
};

export function Tile({
  videoTrack,
  audioTrack,
  name,
  id,
  isLocal = false,
  className,
}: Props) {
  const isMuted = !audioTrack || audioTrack.metadata?.paused;
  const { [id]: isSpeaking } = useVAD({ peerIds: [id] });

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl border border-[#48474c]/40 bg-[#131317]",
        className,
      )}
    >
      <div className="relative h-full w-full">
        {videoTrack && !videoTrack.metadata?.paused && (
          <VideoPlayer
            className="z-20 h-full w-full object-cover"
            stream={videoTrack.stream}
            peerId={id}
            muted={isLocal}
          />
        )}

        {(!videoTrack || videoTrack.metadata?.paused) && (
          <div className="grid h-full w-full place-items-center bg-[#19191e]">
            <span className="font-body text-sm text-[#acaab0]">Camera off</span>
          </div>
        )}

        {!isLocal && <AudioPlayer stream={audioTrack?.stream} />}

        <Badge className="absolute bottom-2 left-2 z-30 flex items-center gap-3 border-[#48474c]/50 bg-[#0e0e12]/80 px-3 py-1.5 text-[#fcf8fe] backdrop-blur-xl">
          <span className="font-body text-sm">{name}</span>

          {isMuted ? (
            <span title="Muted">🔇</span>
          ) : (
            <span title="Unmuted">🔊</span>
          )}

          {isSpeaking ? (
            <span title="Speaking">🗣</span>
          ) : (
            <span title="Silent">🤐</span>
          )}
        </Badge>
      </div>
    </div>
  );
}
