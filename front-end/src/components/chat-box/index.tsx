"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { useEffect, useState } from "react";
import { ChatInput } from "../chat-input";
import { ChatItem } from "../chat-item";
import styles from "./styles.module.css";

const CHAT_KEYS = "chat-history";

export type Message = {
  user: string;
  text: string;
  type: "chat" | "delete-command";
};

export type ChatBoxProps = {
  title?: string;
  classNames?: string;
  user: string;
};

export function ChatBox({ title, classNames, user }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const storeMessage = (message: Message) => {
    setMessages((prevMessages) => {
      const newMessages =
        message.type === "chat"
          ? [...prevMessages, message]
          : prevMessages.filter((prevMessage) => {
              return prevMessage.user !== message.user;
            });
      window.localStorage.setItem(CHAT_KEYS, JSON.stringify(newMessages));
      return newMessages;
    });
  };

  const socket = useChatSocket({
    url: process.env.NEXT_PUBLIC_WS_URL,
    onNewMessage: (dataString) => {
      const newMessage = JSON.parse(dataString) as Message;
      storeMessage(newMessage);
    },
  });

  const onSendMessage = (type: Message["type"], text: string) => {
    const newMessage: Message = { user, text, type };
    storeMessage(newMessage);
    socket.sendMessage(JSON.stringify(newMessage));
  };

  const onClearMessage = () => {
    onSendMessage("delete-command", "");
  };

  useEffect(() => {
    const storedMessages = window.localStorage.getItem(CHAT_KEYS);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  return (
    <section className={`${styles.chatBox} ${classNames}`}>
      {title && (
        <div className={styles.titleContainer}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearMessage}
          >
            Clear
          </button>
        </div>
      )}
      <div className={styles.chatContainer}>
        {messages.map((message, i) => {
          const lastMessage = messages[i - 1];
          const nextMessage = messages[i + 1];

          const firstUserBlock = lastMessage?.user !== message.user;
          const lastUserBlock = nextMessage?.user !== message.user;

          return (
            <ChatItem
              key={i}
              direction={message.user === user ? "right" : "left"}
              user={message.user}
              isFirstBlock={firstUserBlock}
              isLastBlock={lastUserBlock}
            >
              {message.text}
            </ChatItem>
          );
        })}
      </div>
      <div className={styles.inputContainer}>
        <ChatInput
          onSend={(text) => {
            onSendMessage("chat", text);
          }}
        />
      </div>
    </section>
  );
}
