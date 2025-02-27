import { ChatInput } from "../chat-input";
import { ChatItem } from "../chat-item";
import styles from "./styles.module.css";

export type ChatBoxProps = {
  title?: string;
  classNames?: string;
};

export function ChatBox({ title, classNames }: ChatBoxProps) {
  return (
    <section className={`${styles.chatBox} ${classNames}`}>
      {title && (
        <div className={styles.titleContainer}>
          <h2>{title}</h2>
        </div>
      )}
      <div className={styles.chatContainer}>
        {[...Array(100)].map((_, i) => (
          <ChatItem
            key={i}
            direction={i % 2 === 0 ? "left" : "right"}
            alias={i % 2 === 0 ? "LC" : "RC"}
          >
            Chat Item {i}
          </ChatItem>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <ChatInput />
      </div>
    </section>
  );
}
