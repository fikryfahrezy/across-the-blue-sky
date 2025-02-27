import { useEffect, useRef } from "react";

export type UseChatOptions = {
  url: string;
};

export function useChatSocket({ url }: UseChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection.
    const socket = new WebSocket(url);

    // Connection opened
    socket.addEventListener("open", () => {
      socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
    });

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);
}
