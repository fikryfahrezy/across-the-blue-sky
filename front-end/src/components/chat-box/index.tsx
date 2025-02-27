"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatInput } from "../chat-input";
import { ChatItem } from "../chat-item";
import styles from "./styles.module.css";

export type ChatBoxProps = {
  title?: string;
  classNames?: string;
  user: string;
};
export function ChatBox({ title, classNames, user }: ChatBoxProps) {
  const { messages, sendMessage } = useChatSocket({
    url: process.env.NEXT_PUBLIC_WS_URL,
    user: user,
  });

  return (
    <section className={`${styles.chatBox} ${classNames}`}>
      {title && (
        <div className={styles.titleContainer}>
          <h2>{title}</h2>
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
        <ChatInput onSend={sendMessage} />
      </div>
    </section>
  );
}
