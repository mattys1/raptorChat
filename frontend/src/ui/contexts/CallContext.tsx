import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useEventListener } from '../hooks/useEventListener'
import { SERVER_URL } from '../../api/routes'

type CallPayload = { id: number; room_id: number; issuer_id: number }

type ContextType = {
  incomingCall: CallPayload | null
  outgoingCall: CallPayload | null
  acceptCall: (callID: number, roomID: number) => Promise<void>
  rejectCall: (callID: number, roomID: number) => Promise<void>
}

const CallContext = createContext<ContextType | undefined>(undefined)

export const CallProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { userId, token } = useAuth()
  const navigate = useNavigate()  // added
  const [incomingCall, setIncomingCall] = useState<CallPayload | null>(null)
  const [outgoingCall, setOutgoingCall] = useState<CallPayload | null>(null)
  const [event] = useEventListener<CallPayload>(
    `user:${userId}`,
    ['call_requested', 'call_started', 'call_rejected'],
  )

  useEffect(() => {
    if (event.event === 'call_requested' && event.item) {
      if (event.item.issuer_id !== userId) setIncomingCall(event.item)
      else setOutgoingCall(event.item)
    }
    if (event.event === 'call_started' && event.item) {
      setIncomingCall(null)
      setOutgoingCall(null)
      navigate(`/chatroom/${event.item.room_id}/call`)  // added
    }
    if (event.event === 'call_rejected') {
      setOutgoingCall(null)
    }
  }, [event, userId])

  const headers = { 'Content-Type': 'application/json', authorization: `Bearer ${token}` }
  const acceptCall = async (cid: number, rid: number) => {
    await fetch(`${SERVER_URL}/rooms/${rid}/calls/${cid}/accept`, { method: 'POST', headers })
    setIncomingCall(null)
  }
  const rejectCall = async (cid: number, rid: number) => {
    await fetch(`${SERVER_URL}/rooms/${rid}/calls/${cid}/reject`, { method: 'POST', headers })
    setIncomingCall(null)
  }

  return (
    <CallContext.Provider value={{ incomingCall, outgoingCall, acceptCall, rejectCall }}>
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error('useCall must be used inside CallProvider')
  return ctx
}