import { useEffect, useRef, useState } from "react";

export type Message = {
  user: string;
  text: string;
};

export type UseChatOptions = {
  url: string;
  user: string;
};

export function useChatSocket({ url, user }: UseChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Create WebSocket connection.
    const socket = new WebSocket(url);

    // Listen for messages
    socket.addEventListener("message", (event) => {
      setMessages((prevMessages) => [...prevMessages, JSON.parse(event.data)]);
    });

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = (text: string) => {
    const newMessage: Message = { user, text };

    setMessages((prevMessages) => {
      return [...prevMessages, newMessage];
    });

    console.log(wsRef.current);
    wsRef.current?.send(JSON.stringify(newMessage));
  };

  return {
    messages,
    sendMessage,
  };
}
