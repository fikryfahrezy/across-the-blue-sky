import { ChatBox } from "@/components/chat-box";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.titleContainer}>
        <h1>Chitty Chat</h1>
      </div>

      <div className={styles.chatBoxes}>
        <ChatBox
          title="Left Chat"
          user="LC"
          classNames={`${styles.chatBox} ${styles.chatBoxLeft}`}
        />
        <ChatBox
          title="Right Chat"
          user="RC"
          classNames={`${styles.chatBox} ${styles.chatBoxRight}`}
        />
      </div>
    </main>
  );
}
