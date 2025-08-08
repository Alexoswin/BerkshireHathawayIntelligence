import { useState } from "react";
import "./App.css";
import Floatingicons from "./Floatingicons.tsx";
import Nav from "./Nav.tsx";
import PdfUpload from "./PdfUpload.tsx";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/ask?question=${encodeURIComponent(input)}`
      );
      const data = await response.json();

      if (response.ok) {
        const botMessage: Message = { text: data.answer, sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage: Message = { text: `Error: ${data.error}`, sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      const botMessage: Message = {
        text: "Network error. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
      <div className="containerStyle">
        <Floatingicons />
        <div className="chat-container">
          <header className="chat-header">💬 AI Chatbot</header>

          <div className="chat-window">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender} fade-in`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="message bot fade-in">
                <em>Typing...</em>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              ✉
            </button>
          </div>
        </div>
      </div>

      <PdfUpload />
    </>
  );
}
