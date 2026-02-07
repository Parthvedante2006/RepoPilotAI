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
    <div className="flex flex-col h-[80vh] max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Chat about {repoName || 'the repo'}</h2>
          <p className="text-xs text-indigo-100 opacity-90">Ask anything — architecture, functions, bugs, improvements...</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-lg font-medium">Start asking questions about the repository</p>
            <p className="text-sm mt-2">Example: "Explain the main architecture" or "How does authentication work?"</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.type === 'bot' && (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 mr-3 flex items-center justify-center text-white font-bold text-sm shadow">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] px-5 py-3.5 rounded-2xl shadow-sm ${
                msg.type === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 mr-3 flex items-center justify-center text-white font-bold text-sm shadow animate-pulse">
              AI
            </div>
            <div className="bg-white dark:bg-gray-800 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-600 dark:text-red-400 py-4">{error}</p>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-5 py-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 transition"
            placeholder="Ask anything about the repository..."
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-4 rounded-xl shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInterface;


