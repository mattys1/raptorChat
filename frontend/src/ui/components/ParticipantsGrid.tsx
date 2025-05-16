import { TrackReference, TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { useState } from "react";
import ParticipantTileCustom from "./ParticipantTileCustom";
import { Track } from "livekit-client";

const ParticipantsGrid = ({ tracks }: { tracks: TrackReference[] }) => {
	const participants = [...new Set (tracks.map(track => track.participant.identity) as number[])]

	console.log("participants", participants)
	return (
		<div className={`w-full h-full grid gap-x-8 ${
      participants.length === 1 ? 'place-items-center' : 
      participants.length === 2 ? 'grid-cols-2' : 
      participants.length === 3 ? 'grid-cols-3' : 
      participants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
      'grid-cols-3 auto-rows-fr'
    }`}>
			{participants.map(participant => {
				return (
					<div key={participant}>
						<ParticipantTileCustom id={participant} tracks={{
							audio: tracks.find(track => track.participant.identity === participant && track.source === Track.Source.Microphone) as TrackReference,
							camera: tracks.find(track => track.participant.identity === participant && track.source === Track.Source.Camera) as TrackReference,
							screenShare: tracks.find(track => track.participant.identity === participant && track.source === Track.Source.ScreenShare) as TrackReference,
						}} />
					</div>
				)
			})}
		</div>
	)
}

export default ParticipantsGrid;
