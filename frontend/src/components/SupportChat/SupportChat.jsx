import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Check,
  ChevronDown,
  LifeBuoy,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { sendSupportMessage } from "./support.service";
import styles from "./SupportChat.module.css";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I’m Forum Guide. I can help you navigate the forum, search for questions, or prepare a clearer technical post.",
};

const QUICK_PROMPTS = [
  "How do I ask a good question?",
  "How does AI search work?",
  "Where can I find my topics?",
];

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdRef = useRef(0);

  const nextMessageId = (role) => {
    messageIdRef.current += 1;
    return `${role}-${messageIdRef.current}`;
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const submitMessage = async (event, prompt = input) => {
    event?.preventDefault();
    const content = prompt.trim();
    if (!content || isSending) return;

    const userMessage = {
      id: nextMessageId("user"),
      role: "user",
      content,
    };
    const conversation = messages.map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const result = await sendSupportMessage({
        message: content,
        messages: conversation,
      });
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId("assistant"),
          role: "assistant",
          content: result.data.reply,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "I could not connect right now. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const clearConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setError("");
  };

  return (
    <div className={styles.chatRoot}>
      {isOpen && (
        <section className={styles.panel} aria-label="Forum Guide support chat">
          <header className={styles.panelHeader}>
            <div className={styles.headerIdentity}>
              <div className={styles.headerIcon}>
                <Sparkles size={18} aria-hidden="true" />
              </div>
              <div>
                <h2>Forum Guide</h2>
                <p>
                  <span className={styles.statusDot} /> Here to help
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={clearConversation}
                aria-label="Clear chat"
                title="Clear chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close support chat"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className={styles.messageArea} aria-live="polite">
            {messages.map((message) => (
              <div
                className={`${styles.messageRow} ${message.role === "user" ? styles.userRow : ""}`}
                key={message.id}
              >
                <div className={styles.messageAvatar}>
                  {message.role === "user" ? (
                    <User size={14} />
                  ) : (
                    <Bot size={15} />
                  )}
                </div>
                <div
                  className={`${styles.messageBubble} ${message.role === "user" ? styles.userBubble : ""}`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isSending && (
              <div className={styles.messageRow}>
                <div className={styles.messageAvatar}>
                  <Bot size={15} />
                </div>
                <div
                  className={styles.typingBubble}
                  aria-label="Forum Guide is typing"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {messages.length === 1 && (
            <div className={styles.quickPrompts}>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => submitMessage(null, prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {error && <p className={styles.errorMessage}>{error}</p>}

          <form className={styles.composer} onSubmit={submitMessage}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the forum..."
              aria-label="Message Forum Guide"
              rows={1}
              maxLength={1200}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage(event);
                }
              }}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
          <p className={styles.composerHint}>
            Press Enter to send · Shift + Enter for a new line
          </p>
        </section>
      )}

      <button
        type="button"
        className={`${styles.launcher} ${isOpen ? styles.launcherOpen : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Minimize support chat" : "Open support chat"}
        title={isOpen ? "Minimize support chat" : "Open support chat"}
      >
        {isOpen ? <ChevronDown size={21} /> : <MessageCircle size={23} />}
        {!isOpen && <span>Need help?</span>}
        <span className={styles.launcherCheck}>
          <Check size={10} />
        </span>
      </button>
    </div>
  );
}
