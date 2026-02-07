import { useState } from "react";
import { askQuestion } from "./Api";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res = await askQuestion(userMsg.text);

    const botMsg = {
      role: "bot",
      text: res.success ? res.answer : res.message,
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded max-w-xl ${
              m.role === "user"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700"
            }`}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400">Thinking...</div>
        )}
      </div>

      <div className="p-4 bg-gray-800 flex gap-2">
        <input
          className="flex-1 p-2 rounded text-black"
          placeholder="Ask about the repository..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}



