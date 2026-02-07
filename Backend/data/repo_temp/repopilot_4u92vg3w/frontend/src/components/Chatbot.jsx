import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, X, Mic, MicOff } from "lucide-react";

export default function Chatbot() {
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "👋 Hello! I'm EduGuide AI. Ask me anything! You can also use the mic 🎤 to speak.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Ref for auto-growing textarea

  // Speech Recognition setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US"; // Change to hi-IN, ta-IN, etc. if needed

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setInput(finalTranscript + interimTranscript);
    };

    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  }, []);

  // Toggle microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Auto-grow textarea when text is long
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Grow up to 120px
    }
  }, [input]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { text: userMsg, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5001/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: data.reply || "Sorry, I couldn't respond right now.", sender: "bot" },
        ]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { text: "🌐 Connection failed. Is the backend running on port 5001?", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpenChat(!openChat)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition z-40"
      >
        {openChat ? <X className="w-10 h-10" /> : <MessageCircle className="w-10 h-10" />}
      </button>

      {/* Chat Window */}
      {openChat && (
        <div className="fixed bottom-28 right-8 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-3xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl">EduGuide AI</h3>
              <p className="text-sm opacity-90">Your learning assistant</p>
            </div>
            <button
              onClick={() => setOpenChat(false)}
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-5 py-4 rounded-3xl text-base shadow-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-5 py-4 rounded-3xl shadow-md">
                  <span className="flex space-x-2">
                    <span className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area with Growing Textarea + Mic */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 items-end">
              {/* Mic Button */}
              <button
                onClick={toggleListening}
                className={`p-4 rounded-full transition flex-shrink-0 ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Auto-growing Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type or speak your question..."
                rows={1}
                className="flex-1 max-h-[120px] min-h-[48px] px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl text-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500 transition resize-none overflow-y-auto"
                disabled={loading}
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white px-6 py-4 rounded-2xl font-bold transition shadow-lg flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>

            {/* Listening feedback */}
            {isListening && (
              <p className="text-xs text-center text-red-500 dark:text-red-400 mt-2">
                Listening... Speak freely! Click stop when done.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

