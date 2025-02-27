import styles from "./styles.module.css";

export type ChatItemProps = {
  children?: React.ReactNode;
  user?: string;
  direction?: "left" | "right";
  isFirstBlock?: boolean;
  isLastBlock?: boolean;
};

export function ChatItem({
  direction = "left",
  user,
  isFirstBlock,
  isLastBlock,
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
      {user && isLastBlock && isLeftDirection && (
        <div className={styles.userContainer}>{user}</div>
      )}
      <div
        className={`${styles.chatBubble} ${
          isLeftDirection && isLastBlock ? styles.arrowUpBefore : ""
        } ${isRightDirection && isLastBlock ? styles.arrowUpAfter : ""} ${
          isLeftDirection && !isLastBlock ? styles.spaceLeft : ""
        } ${isRightDirection && !isLastBlock ? styles.spaceRight : ""} ${
          styles.middleChatBubble
        } ${isFirstBlock ? styles.firstChatBubble : ""}
        } ${isLastBlock ? styles.lastChatBubble : ""}
        `}
      >
        {children}
      </div>
      {user && isLastBlock && isRightDirection && (
        <div className={styles.userContainer}>{user}</div>
      )}
    </div>
  );
}
