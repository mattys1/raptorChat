// frontend/src/ui/hooks/views/useCallRejectRequestHook.ts
import { useSendResource } from "../useSendResource";
import { HttpMethods } from "../useSendResource";

// This hook will call POST /api/rooms/{roomId}/calls/reject_request
export const useCallRejectRequestHook = (roomId: number) => {
  const endpoint = `/api/rooms/${roomId}/calls/reject_request`;
  const [state, error, sendRequest] = useSendResource<null>(
    endpoint,
    HttpMethods.POST
  );
  return [state, error, sendRequest] as const;
};