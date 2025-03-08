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
  const { sessionId } = useParams<{ sessionId: string }>();
  console.log("🔹 Current URL sessionId:", sessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ✅ End current session & generate summary
  const endSession = async () => {
    if (!sessionId) return;
  
    console.log("🔹 Ending session:", sessionId);
    try {
      await axios.post(`${API_BASE_URL}/end_session/${sessionId}`);
      console.log("✅ Session summary saved.");
  
      // ✅ Update sidebar after ending session
      fetchConversations();
    } catch (error) {
      console.error("❌ Failed to end session:", error);
    }
  
    setMessages([]); // ✅ Reset chat messages
  };
  
  
  
  

  // ✅ Handle "New Chat" button click
  const startNewChat = async () => {
    if (sessionId) {
      console.log("🔹 Ending session before starting a new one...");
      await endSession();  // ✅ Ensure session ends before creating a new one
    }
  
    // ✅ Generate a new unique session ID
    const newSessionId = Math.random().toString(36).substring(2, 15);
  
    navigate(`/c/${newSessionId}`, { replace: true }); // ✅ Ensure URL updates
    setMessages([]); // ✅ Clear UI before starting fresh
  };
  
  
  
  
  
  
  
  
  
  

  // ✅ Detect when user loads `/` (base URL) without a session and end any active session
  useEffect(() => {
    if (!sessionId && location.pathname === "/") {
      console.log("🔹 No session found. Ending any active session...");
      endSession(); // ✅ Ensures Redis/PostgreSQL cleanup
    }
  }, [sessionId, location.pathname]);
  
  
  

  // ✅ Load chat history when session ID changes
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
  
    console.log("🔹 Fetching chat history for session:", sessionId);
    setLoading(true);
  
    axios.get(`${API_BASE_URL}/chat_history/${sessionId}`)
      .then((response) => {
        console.log("✅ Chat history received:", response.data);
  
        if (response.data.messages) {
          const pastMessages = response.data.messages.map((msg: any) => ({
            role: msg.role,
            text: msg.message,
          }));
  
          console.log("📝 Updating messages state with:", pastMessages);
          setMessages(pastMessages);
        } else {
          console.log("⚠️ No messages found, clearing chat.");
          setMessages([]);
        }
      })
      .catch((error) => console.error("❌ Failed to load past messages:", error))
      .finally(() => setLoading(false));
  }, [sessionId]); // ✅ Fetch chat history when sessionId changes
  
  

  // ✅ Detect session ID changes (useful for debugging)
  useEffect(() => {
    console.log("🔹 URL changed, detected session:", sessionId);
  }, [sessionId]);  // ✅ React should trigger this when URL changes
  


  // ✅ Load sidebar past sessions
  useEffect(() => {
    axios.get(`${API_BASE_URL}/conversations/user_123`)
      .then((response) => setConversations(response.data.conversations))
      .catch((error) => console.error("Failed to load past sessions:", error));
  }, []); // ✅ Runs on first render
  

  // Scroll chat to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    let activeSessionId = sessionId;
  
    // ✅ If no session exists, create a new session & update URL
    if (!activeSessionId) {
      activeSessionId = Math.random().toString(36).substring(2, 15);
      navigate(`/c/${activeSessionId}`, { replace: true }); // ✅ Update URL
    }
  
    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
  
    try {
      // ✅ Wait until URL updates before sending message
      setTimeout(async () => {
        const response = await axios.post(`${API_BASE_URL}/chatbot`, {
          user_id: "user_123",
          session_id: activeSessionId,
          message: input,
        });
  
        const aiResponse: Message = { role: "assistant", text: response.data.response };
        setMessages((prev) => [...prev, aiResponse]);
  
        // ✅ If session ends, refresh sidebar & navigate back to `/`
        if (response.data.status === "Session ended") {
          console.log("🔹 Session ended! Reloading sidebar...");
          const res = await axios.get(`${API_BASE_URL}/conversations/user_123`);
          setConversations(res.data.conversations);
          navigate("/"); // ✅ Reset URL after session ends
        }
      }, 100); // ✅ Small delay ensures session is correctly used
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error: Unable to reach AI." }]);
    }
  };
  
  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/conversations/user_123`);
      setConversations(res.data.conversations); // ✅ Replace, don't append
    } catch (error) {
      console.error("❌ Failed to fetch past sessions:", error);
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
            onClick={() => {
              if (sessionId !== conv.session_id) {  // ✅ Prevent unnecessary reloads
                console.log("🔹 Switching to session:", conv.session_id);
                navigate(`/c/${conv.session_id}`, { replace: true }); // ✅ Update URL correctly
                setMessages([]); // ✅ Clear UI before loading a new one
              }
            }}
            className={`w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md text-left truncate 
              ${sessionId === conv.session_id ? "bg-gray-600" : ""}`} // ✅ Highlight active session
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
          {loading ? (
            <div className="text-center text-gray-500">🔄 Loading chat...</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className={`rounded-lg px-4 py-2 max-w-3xl ${msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-800 self-start"}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
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
