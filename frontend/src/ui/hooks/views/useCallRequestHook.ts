// frontend/src/ui/hooks/views/useCallRequestHook.ts
import { useSendResource } from "../useSendResource";
import { HttpMethods } from "../useSendResource";

// This hook will call POST /api/rooms/{roomId}/calls/request
export const useCallRequestHook = (roomId: number) => {
  const endpoint = `/api/rooms/${roomId}/calls/request`;
  // We don't expect any response body, so use <null> as the generic.
  const [state, error, sendRequest] = useSendResource<null>(
    endpoint,
    HttpMethods.POST
  );
  return [state, error, sendRequest] as const;
};