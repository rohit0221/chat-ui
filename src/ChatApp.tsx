import React, { useState, useEffect, useRef } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");

    // Simulate assistant response after 1s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "🤖 I'm here to help! How can I assist?" },
      ]);
    }, 1000);
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar (Fixed) */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">ChatGPT UI</h1>

        {/* New Chat Button */}
        <button className="w-full mb-4 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-md text-left">
          + New Chat
        </button>

        {/* Placeholder for Previous Conversations */}
        <nav className="flex-1 space-y-2 overflow-auto">
          <button className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md text-left">
            Conversation 1
          </button>
          <button className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md text-left">
            Conversation 2
          </button>
        </nav>
      </aside>

      {/* Chat Section (Full Width) */}
      <main className="flex-1 flex flex-col bg-gray-100 h-full">
        {/* Chat Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-end"
        >
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col items-start">
              {/* Message Bubble (Always on the Left) */}
              <div
                className={`rounded-lg px-4 py-2 max-w-3xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white self-end" // User message
                    : "bg-gray-200 text-gray-800 self-start" // Assistant message
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t bg-white flex items-center gap-2">
          <Input
            className="flex-grow p-2 border rounded-md focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button onClick={sendMessage} className="flex items-center gap-1">
            <Send size={16} />
            Send
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChatApp;
