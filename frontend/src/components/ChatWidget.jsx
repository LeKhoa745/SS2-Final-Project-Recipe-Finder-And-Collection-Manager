import { useState, useRef, useEffect } from "react";
import { apiClient } from "../api/apiClient";
import { getAccessToken } from "../utils/session";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", content: "Hi! I'm your AI Kitchen Assistant. How can I help you today? 🍳" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await apiClient("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6) // Send last 6 messages for context
        })
      });

      setMessages((prev) => [...prev, { role: "model", content: response.data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I'm having a bit of trouble connecting to the kitchen right now. 🧀" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!getAccessToken()) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-orange-600 to-orange-400 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <span className="material-symbols-outlined text-2xl">restaurant</span>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Chef AI</h3>
                <p className="text-[10px] text-orange-100 font-medium uppercase tracking-widest">Always at your service</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-orange-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-orange-600 text-white rounded-tr-none" 
                    : "bg-white text-[#2d1b11] border border-orange-100 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-orange-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-orange-50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recipe or tip..."
              className="flex-1 bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-600/20 transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-orange-600 text-white p-2.5 rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-md shadow-orange-200"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 group ${
          isOpen ? "bg-white text-orange-600 rotate-90" : "bg-orange-600 text-white"
        }`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? "close" : "smart_toy"}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
          </span>
        )}
      </button>
    </div>
  );
}
