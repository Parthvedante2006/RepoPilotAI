// src/App.jsx
import { useState } from 'react';
import RepoIndexer from './components/RepoIndexer';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isIndexed, setIsIndexed] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [indexingStatus, setIndexingStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleIndexRepo = async (url) => {
    setRepoUrl(url);
    setIndexingStatus('Indexing repository...');
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/index_repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url }),
      });
      const data = await response.json();
      if (data.success) {
        setIsIndexed(true);
        setIndexingStatus('Repository indexed successfully!');
      } else {
        setError(data.message || 'Indexing failed');
        setIndexingStatus(null);
      }
    } catch (err) {
      setError('Failed to connect to backend. Is it running?');
      setIndexingStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              RP
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              RepoPilot
            </h1>
          </div>
          {isIndexed && (
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
              {repoUrl.replace('https://github.com/', '')}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl">
          {!isIndexed ? (
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Understand Any GitHub Repo
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Paste a repository URL → get instant explanations, architecture overview, and ask anything about the code.
              </p>
              <RepoIndexer onIndex={handleIndexRepo} status={indexingStatus} error={error} />
            </div>
          ) : (
            <ChatInterface repoName={repoUrl.split('/').slice(-2).join('/')} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>RepoPilot — AI-powered GitHub repo explorer • Built with React, Vite, Tailwind & Flask</p>
          <p className="mt-2">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 mx-2">Privacy</a> •
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 mx-2">Terms</a> •
            Made with ❤️ in Pune
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;


