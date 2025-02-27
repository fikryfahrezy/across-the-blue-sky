import styles from "./styles.module.css";

export type ChatItemProps = {
  children?: React.ReactNode;
  alias?: string;
  direction?: "left" | "right";
};

export function ChatItem({
  direction = "left",
  alias,
  children,
}: ChatItemProps) {
  const isLeftDirection = direction === "left";
  const isRightDirection = !isLeftDirection;

  return (
    <div
      className={`${styles.container} ${
        isRightDirection ? styles.itemRight : ""
      }`}
    >
      {alias && isLeftDirection && (
        <div className={styles.aliasContainer}>{alias}</div>
      )}
      <div
        className={`${styles.chatBubble}  ${
          isLeftDirection ? styles.arrowUpBefore : styles.arrowUpAfter
        }`}
      >
        {children}
      </div>
      {alias && isRightDirection && (
        <div className={styles.aliasContainer}>{alias}</div>
      )}
    </div>
  );
}
