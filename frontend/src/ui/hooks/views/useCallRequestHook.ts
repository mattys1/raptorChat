import { useSendResource } from "../useSendResource";
import { HttpMethods } from "../useSendResource";

export const useCallRequestHook = (roomId: number) => {
  const endpoint = `/api/rooms/${roomId}/calls/request`;
  const [state, error, sendRequest] = useSendResource<null>(
    endpoint,
    HttpMethods.POST
  );
  return [state, error, sendRequest] as const;
};