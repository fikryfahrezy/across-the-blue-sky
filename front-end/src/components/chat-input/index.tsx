"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

const noop = () => {
  return;
};

export type ChatInputProps = {
  onSend?: (text: string) => void;
};

export function ChatInput({ onSend = noop }: ChatInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const sendContent = () => {
    setShowPlaceholder(true);
    onSend(contentRef.current);
    contentRef.current = "";
    if (inputRef.current) {
      inputRef.current.innerHTML = "";
    }
  };

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const onInput = () => {
      if (!inputRef.current) {
        return;
      }

      let content = inputRef.current.innerText;

      // When message cleared by user input it will leave a new line character
      if (content.length === 1 && content.trim() === "") {
        content = "";
      }

      setShowPlaceholder(!content);
      contentRef.current = content;
    };

    const onKeydown = (event: KeyboardEvent) => {
      const content = contentRef.current;
      const sendingKeyPressed = event.key === "Enter" && !event.shiftKey;

      // Prevent sending empty messages
      if (sendingKeyPressed && !content.trim()) {
        event.preventDefault();
        return;
      }

      // Send message on enter
      if (sendingKeyPressed) {
        event.preventDefault();
        sendContent();
      }
    };

    const abortController = new AbortController();
    inputRef.current.addEventListener("input", onInput, {
      signal: abortController.signal,
    });
    inputRef.current.addEventListener("focusout", onInput, {
      signal: abortController.signal,
    });
    inputRef.current.addEventListener("keydown", onKeydown, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.chatInputContainer}>
        <div
          ref={inputRef}
          className={styles.chatInput}
          contentEditable="true"
          dir="auto"
        ></div>
        {showPlaceholder && (
          <span className={styles.chatInputPlaceholder}>Type a message</span>
        )}
      </div>
      <button type="button" onClick={sendContent} className={styles.sendButton}>
        Send
      </button>
    </div>
  );
}
