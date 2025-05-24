import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVideoChatHook } from "../hooks/views/useVideoChatHook";
import { RoomContext, ConnectionState, RoomAudioRenderer, ControlBar, TrackToggle, useTracks, ParticipantTile, LiveKitRoom, } from "@livekit/components-react";
import { Track } from "livekit-client";
import MicToggleButton from "../components/MicToggleButton";
import ParticipantsGrid from "../components/ParticipantsGrid";

const MyVideoConference: React.FC = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Microphone, withPlaceholder: true },
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex-1 p-4 overflow-auto">
      <ParticipantsGrid tracks={tracks} />
    </div>
  );
};

const VideoChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const key = Number(chatId);
  const { room, audio } = useVideoChatHook(key);
  const navigate = useNavigate();

  return (
    <RoomContext.Provider value={room}>
      <div className="relative flex flex-col h-full bg-gray-900 text-gray-100">
        <MyVideoConference />

        <ConnectionState className="absolute top-2 left-2 text-sm bg-gray-800 px-2 py-1 rounded" />

        <RoomAudioRenderer />

        <div className="bg-gray-800 p-4 flex items-center space-x-2">
          <ControlBar
            className="space-x-2"
            controls={{
              microphone: false,
              camera: false,
              screenShare: true,
              leave: false,
              settings: false,
            }}
          />

          <TrackToggle source={Track.Source.Microphone} />
          <TrackToggle source={Track.Source.Camera} />

          <button
            onClick={() => navigate(-1)}
            className="ml-auto px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>
    </RoomContext.Provider>
  );
};

export default VideoChat;