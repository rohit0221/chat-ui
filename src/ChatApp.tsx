import React, { useState, useEffect, useRef } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Send } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000"; // Adjust based on your backend

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface Conversation {
  session_id: string;
  summary: string;
}

const ChatApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>(); // Get session ID from URL
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ✅ End current session & generate summary
  const endSession = async () => {
    if (!sessionId) return; // ✅ No active session, nothing to do
  
    console.log("🔹 Ending session:", sessionId);
  
    try {
      // ✅ Save session summary before clearing
      await axios.post(`${API_BASE_URL}/save_summary/${sessionId}?user_id=user_123`);
  
      console.log("✅ Session summary saved.");
  
      // ✅ Immediately update sidebar list
      const res = await axios.get(`${API_BASE_URL}/conversations/user_123`);
      setConversations(res.data.conversations);
  
      console.log("✅ Sidebar updated with new session.");
    } catch (error) {
      console.error("❌ Failed to end session or update sidebar:", error);
    }
  
    // ✅ Reset chat UI after ending session
    setMessages([]);
  };
  
  

  // ✅ Handle "New Chat" button click
  const startNewChat = async () => {
    if (sessionId) {
      try {
        console.log("🔹 Ending session before starting a new one...");
  
        await endSession(); // ✅ Properly end session
  
        // ✅ Refresh sidebar after ending session
        const res = await axios.get(`${API_BASE_URL}/conversations/user_123`);
        setConversations(res.data.conversations);
        console.log("✅ Sidebar updated after session end.");
        
      } catch (error) {
        console.error("❌ Failed to end session before starting a new chat:", error);
      }
    }
  
    navigate("/"); // ✅ Reset URL (New session will be created when user sends a message)
  };
  
  

  // ✅ Detect when user loads `/` (base URL) without a session and end any active session
  useEffect(() => {
    if (!sessionId && location.pathname === "/") {
      endSession(); // ✅ Ends previous session when user starts fresh
    }
  }, [sessionId, location.pathname]);
  
  

  // ✅ Load chat history when session ID changes
  useEffect(() => {
    if (!sessionId) return;

    axios.get(`${API_BASE_URL}/chat_history/${sessionId}`)
      .then((response) => {
        const pastMessages = response.data.messages.map((msg: any) => ({
          role: msg.role,
          text: msg.message,
        }));
        setMessages(pastMessages);
      })
      .catch((error) => console.error("Failed to load past messages:", error));
  }, [sessionId]);

  // ✅ Load sidebar past sessions
  useEffect(() => {
    axios.get(`${API_BASE_URL}/conversations/user_123`)
      .then((response) => setConversations(response.data.conversations))
      .catch((error) => console.error("Failed to load past sessions:", error));
  }, []);

  // Scroll chat to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // ✅ If no session exists, create a new session and update the URL
    if (!sessionId) {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      navigate(`/c/${newSessionId}`);
      return;
    }

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot`, {
        user_id: "user_123",
        session_id: sessionId,
        message: input,
      });

      const aiResponse: Message = { role: "assistant", text: response.data.response };
      setMessages((prev) => [...prev, aiResponse]);

      // ✅ If session ends, refresh sidebar
      if (response.data.status === "Session ended") {
        console.log("🔹 Session ended! Reloading sidebar...");
        axios.get(`${API_BASE_URL}/conversations/user_123`)
          .then((res) => setConversations(res.data.conversations))
          .catch((err) => console.error("Failed to refresh past sessions:", err));

        navigate("/"); // Go back to homepage
        return;
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error: Unable to reach AI." }]);
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">ChatGPT UI</h1>

        {/* ✅ New Chat Button */}
        <button onClick={startNewChat} className="w-full mb-4 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-md text-left">
          + New Chat
        </button>

        {/* ✅ Sidebar: List of Past Conversations */}
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.session_id}
              onClick={() => navigate(`/c/${conv.session_id}`)}
              className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md text-left truncate"
            >
              {conv.summary}
            </button>
          ))}
        </div>
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
