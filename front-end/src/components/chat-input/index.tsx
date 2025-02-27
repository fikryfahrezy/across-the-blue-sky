import styles from "./styles.module.css";

export type ChatInputProps = {};

export function ChatInput({}: ChatInputProps) {
  return (
    <div className={styles.container} contentEditable="true" dir="auto"></div>
  );
}
