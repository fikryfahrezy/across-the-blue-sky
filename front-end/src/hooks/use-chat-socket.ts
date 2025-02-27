import { useEffect, useRef } from "react";

const noop = () => {
  return;
};

export type UseChatOptions = {
  url: string;
  onNewMessage?: (dataString: string) => void;
};

export function useChatSocket({ url, onNewMessage = noop }: UseChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection.
    const socket = new WebSocket(url);

    // Listen for messages
    socket.addEventListener("message", (event) => {
      onNewMessage(event.data);
    });

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = (dataString: string) => {
    wsRef.current?.send(dataString);
  };

  return {
    sendMessage,
  };
}
