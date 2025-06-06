import { useSendResource } from "../useSendResource";
import { HttpMethods } from "../useSendResource";

export const useCallRejectRequestHook = (roomId: number) => {
  const endpoint = `/api/rooms/${roomId}/calls/reject_request`;
  const [state, error, sendRequest] = useSendResource<null>(
    endpoint,
    HttpMethods.POST
  );
  return [state, error, sendRequest] as const;
};