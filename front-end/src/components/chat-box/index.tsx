"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { toTitleCase } from "@/lib/string";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "../chat-input";
import { ChatItem } from "../chat-item";
import styles from "./styles.module.css";

const CHAT_KEYS = "chat-history";

export type Message = {
  user: string;
  text: string;
  bot_data: { name: string; detail: Record<string, unknown> } | null;
  bot_to: string;
  type: "chat" | "clear-command" | "bot-message";
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
        message.type === "clear-command"
          ? prevMessages.filter((prevMessage) => {
              return (
                prevMessage.user !== message.user &&
                prevMessage.bot_to !== message.user
              );
            })
          : [...prevMessages, message];
      return newMessages;
    });
  };

  const onNewMessage = useMemo(() => {
    let debounceTimer: undefined | number;

    return (dataString: string) => {
      const newMessage = JSON.parse(dataString) as Message;
      if (newMessage.user === "bot") {
        newMessage.bot_to = user;
      }
      storeMessage(newMessage);

      if (newMessage.bot_data) {
        return;
      }

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
    const newMessage: Message = {
      user,
      text,
      type,
      bot_data: null,
      bot_to: "",
    };
    storeMessage(newMessage);
    socket.sendMessage(JSON.stringify(newMessage));
  };

  const onClearMessage = () => {
    onSendMessage("clear-command", "");
  };

  useEffect(() => {
    const storedMessages = window.localStorage.getItem(`${CHAT_KEYS}_${user}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [user]);

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
      window.localStorage.setItem(
        `${CHAT_KEYS}_${user}`,
        JSON.stringify(messages)
      );
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

            const children = message.bot_data?.detail
              ? `${toTitleCase(
                  message.bot_data.detail.name
                )} details from API\nHeight: ${
                  message.bot_data.detail.height
                }\nWeight: ${message.bot_data.detail.weight}`
              : message.text;

            return (
              <ChatItem
                key={i}
                direction={
                  message.user === user || message.bot_to === user
                    ? "right"
                    : "left"
                }
                user={message.user}
                isFirstBlock={firstUserBlock}
                isLastBlock={lastUserBlock}
              >
                {children}
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
