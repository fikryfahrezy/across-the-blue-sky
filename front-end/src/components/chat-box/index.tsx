"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "../chat-input";
import { ChatItem } from "../chat-item";
import styles from "./styles.module.css";

const CHAT_KEYS = "chat-history";

export type Message = {
  user: string;
  text: string;
  type: "chat" | "clear-command";
};

export type ChatBoxProps = {
  title?: string;
  classNames?: string;
  user: string;
};

export function ChatBox({ title, classNames, user }: ChatBoxProps) {
  const chatListContainer = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLSpanElement>(null);

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [newMessageAppear, setNewMessageAppear] = useState(false);
  const [showBackToBottomButton, setShowBackToBottomButton] = useState(false);

  const scrollChatToBottom = (behavior?: ScrollBehavior | undefined) => {
    if (!chatListContainer.current) {
      return;
    }

    chatListContainer.current.scrollTo({
      behavior: behavior,
      top: chatListContainer.current.scrollHeight,
    });
  };

  const storeMessage = (message: Message) => {
    setMessages((_prevMessages) => {
      const prevMessages = _prevMessages || [];
      const newMessages =
        message.type === "chat"
          ? [...prevMessages, message]
          : prevMessages.filter((prevMessage) => {
              return prevMessage.user !== message.user;
            });
      return newMessages;
    });
  };

  const onNewMessage = useMemo(() => {
    let debounceTimer: undefined | number;

    return (dataString: string) => {
      const newMessage = JSON.parse(dataString) as Message;
      storeMessage(newMessage);

      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
        setNewMessageAppear(false);
      }

      setNewMessageAppear(true);
      debounceTimer = window.setTimeout(() => {
        setNewMessageAppear(false);
      }, 1000);
    };
  }, []);

  const socket = useChatSocket({
    url: process.env.NEXT_PUBLIC_WS_URL,
    onNewMessage: onNewMessage,
  });

  const onSendMessage = (type: Message["type"], text: string) => {
    const newMessage: Message = { user, text, type };
    storeMessage(newMessage);
    socket.sendMessage(JSON.stringify(newMessage));
  };

  const onClearMessage = () => {
    onSendMessage("clear-command", "");
  };

  useEffect(() => {
    const storedMessages = window.localStorage.getItem(CHAT_KEYS);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    if (!chatListContainer.current) {
      return;
    }

    const onScroll = () => {
      if (!chatListContainer.current) {
        return;
      }

      const distanceFromBottom =
        chatListContainer.current.scrollHeight -
        chatListContainer.current.scrollTop -
        chatListContainer.current.clientHeight;
      setShowBackToBottomButton(distanceFromBottom > 100);
    };

    const abortController = new AbortController();
    chatListContainer.current.addEventListener("scroll", onScroll, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (!showBackToBottomButton) {
      scrollChatToBottom();
    }
  }, [showBackToBottomButton, messages]);

  useEffect(() => {
    if (messages) {
      window.localStorage.setItem(CHAT_KEYS, JSON.stringify(messages));
    }
  }, [messages]);

  return (
    <section
      className={`${styles.chatBox} ${
        newMessageAppear ? styles.flash : ""
      } ${classNames}`}
    >
      {title && (
        <div className={styles.titleContainer}>
          <h2>{title}</h2>
          <button type="button" onClick={onClearMessage}>
            Clear
          </button>
        </div>
      )}

      <div ref={chatListContainer} className={styles.chatContainer}>
        {!messages || messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message, i) => {
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
          })
        )}
        <span ref={messagesEndRef}></span>
      </div>
      <div className={styles.inputContainer}>
        <button
          type="button"
          onClick={() => {
            scrollChatToBottom("smooth");
          }}
          className={`${styles.bottomButton} ${
            showBackToBottomButton ? styles.show : ""
          }`}
        >
          V
        </button>
        <ChatInput
          onSend={(text) => {
            onSendMessage("chat", text);
          }}
        />
      </div>
    </section>
  );
}
