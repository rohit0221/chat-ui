import React, { useState, useEffect, useRef } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Send } from "lucide-react";
import axios from "axios";

// Define API URL (replace with actual backend URL)
const API_BASE_URL = "http://localhost:8000"; // Adjust if backend is hosted elsewhere

interface Message {
  role: "user" | "assistant";
  text: string;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => Math.random().toString(36).substring(7)); // Generate session ID
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll chat to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]); // Show user message instantly
    setInput("");

    try {
      // Send message to backend
      const response = await axios.post(`${API_BASE_URL}/chatbot`, {
        user_id: "user_123", // Replace with real user ID if needed
        session_id: sessionId,
        message: input,
      });

      const aiResponse: Message = { role: "assistant", text: response.data.response };
      setMessages((prev) => [...prev, aiResponse]); // Display AI response

    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error: Unable to reach AI." }]);
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar (Fixed) */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">ChatGPT UI</h1>

        {/* New Chat Button */}
        <button onClick={() => setMessages([])} className="w-full mb-4 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-md text-left">
          + New Chat
        </button>

        {/* Placeholder for Conversations */}
        <nav className="flex-1 space-y-2 overflow-auto">
          <button className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md text-left">
            Conversation 1
          </button>
          <button className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md text-left">
            Conversation 2
          </button>
        </nav>
      </aside>

      {/* Chat Section */}
      <main className="flex-1 flex flex-col bg-gray-100 h-full">
        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-end">
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className={`rounded-lg px-4 py-2 max-w-3xl ${msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-800 self-start"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t bg-white flex items-center gap-2">
          <Input className="flex-grow p-2 border rounded-md focus:outline-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
          <Button onClick={sendMessage} className="flex items-center gap-1">
            <Send size={16} /> Send
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChatApp;
