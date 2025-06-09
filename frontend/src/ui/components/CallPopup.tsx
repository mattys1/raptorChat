import React, { useEffect, useRef } from 'react'
import { useCall } from '../contexts/CallContext'
import callsong from '../assets/ringsong/callsound.mp3'  // ensure asset exists

const CallPopup: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useCall()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (incomingCall) audioRef.current?.play()
    else {
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.currentTime = 0
    }
  }, [incomingCall])

  if (!incomingCall) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="mb-4">
          Incoming call from user <strong>{incomingCall.issuer_id}</strong>
        </p>
        <div className="flex justify-around">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => acceptCall(incomingCall.id, incomingCall.room_id)}>
            Accept
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => rejectCall(incomingCall.id, incomingCall.room_id)}>
            Reject
          </button>
        </div>
        <audio ref={audioRef} src={callsong} loop preload="auto" />
      </div>
    </div>
  )
}

export default CallPopup