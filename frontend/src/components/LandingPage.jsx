// src/components/LandingPage.jsx
import { useState } from 'react';
import RepoIndexer from './RepoIndexer';

function LandingPage({ onGetStarted, onAnalyze }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (url) => {
    onAnalyze(url);
    // Optional: show indexing feedback here if you want
    setStatus('Analyzing...');
    setTimeout(() => setStatus(null), 2000); // fake delay
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 md:p-10 border-b border-gray-800/50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          RepoPilot
        </h1>
        <div className="space-x-4">
          <button onClick={onGetStarted} className="px-6 py-2 rounded-full border border-gray-700 hover:bg-gray-800">
            Sign In
          </button>
          <button onClick={onGetStarted} className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
          Understand Any GitHub Repo<br />Instantly.
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl">
          Chat with your codebase. Get architecture overviews, trace dependencies, find bugs — in seconds.
        </p>

        <RepoIndexer 
          onIndex={handleAnalyze} 
          status={status} 
          error={error} 
          bigVersion={true} // we'll add prop to make it larger
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {[
            { icon: '🧠', title: 'Codebase Analysis', desc: 'High-level summaries, patterns, quality insights' },
            { icon: '🗺️', title: 'Architecture Discovery', desc: 'Visual maps, service flows, data pipelines' },
            { icon: '🔗', title: 'Dependency Mapping', desc: 'Trace internal/external packages, bottlenecks' },
          ].map((card, i) => (
            <div key={i} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all">
              <div className="text-5xl mb-4">{card.icon}</div>
              <h3 className="text-2xl font-semibold mb-3">{card.title}</h3>
              <p className="text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 border-t border-gray-800/50">
        © 2026 RepoPilot • Privacy • Terms • Made in Pune with ❤️
      </footer>
    </div>
  );
}

export default LandingPage;


