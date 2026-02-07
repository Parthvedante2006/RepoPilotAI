// src/components/ChatInterface.jsx
import { useState, useRef, useEffect } from 'react';

function ChatInterface({ repoName }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { type: 'user', text: question.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, { type: 'bot', text: data.answer }]);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to get response. Backend may be down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] bg-gradient-to-b from-gray-950 to-gray-900 rounded-2xl border border-gray-700/60 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-cyan-950/40 to-gray-900 px-6 py-5 border-b border-gray-700/70">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-cyan-100">
              {repoName || 'Repository Chat'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Ask about architecture • functions • bugs • optimizations • anything
            </p>
          </div>
          <div className="text-xs bg-cyan-950/60 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800/40">
            Powered by AI
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-950/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mb-6 border border-cyan-500/30">
              <span className="text-5xl opacity-80">💬</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-200 mb-3">
              Ready to explore this repository?
            </h3>
            <p className="text-gray-400 max-w-lg">
              Ask anything — from high-level architecture to specific function behavior,
              dependency issues, performance bottlenecks or potential improvements.
            </p>
            <p className="text-sm text-gray-500 mt-6">
              Example questions:
            </p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {[
                "Explain the main architecture",
                "How does authentication work?",
                "Where is the API layer defined?",
                "Find potential security issues",
              ].map((ex, i) => (
                <div
                  key={i}
                  className="bg-gray-800/60 px-4 py-2 rounded-full text-sm text-cyan-300 border border-cyan-800/30 hover:bg-gray-700/60 transition-colors cursor-pointer"
                >
                  {ex}
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            {msg.type === 'bot' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex-shrink-0 mr-4 flex items-center justify-center text-white font-bold shadow-lg">
                AI
              </div>
            )}

            <div
              className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-md ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800/90 text-gray-100 rounded-bl-none border border-gray-700/70'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex-shrink-0 mr-4 flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
              AI
            </div>
            <div className="bg-gray-800/90 px-6 py-4 rounded-2xl rounded-bl-none border border-gray-700/70">
              <div className="flex space-x-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <p className="text-red-400 bg-red-950/30 border border-red-800/50 rounded-xl p-4 inline-block">
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-700/70 bg-gray-900/80 backdrop-blur-sm p-5"
      >
        <div className="flex gap-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about the repository..."
            disabled={loading}
            className="flex-1 px-6 py-5 bg-gray-800/70 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg ${
              loading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/30 hover:scale-[1.02]'
            }`}
          >
            Send
            <span className="text-lg">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInterface;


