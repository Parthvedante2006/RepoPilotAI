// src/components/RepoIndexer.jsx
import { useState } from 'react';

function RepoIndexer({ onIndex, status, error, bigVersion = false }) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onIndex(repoUrl.trim());
    }
  };

  return (
    <div className={`w-full ${bigVersion ? 'max-w-4xl' : 'max-w-2xl'} mx-auto`}>
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-gray-700/60 shadow-2xl backdrop-blur-sm p-8 md:p-10 transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/40"
      >
        <label
          htmlFor="repoUrl"
          className="block text-xl font-semibold text-gray-100 mb-4 tracking-wide"
        >
          GitHub Repository URL
        </label>

        <div className="relative">
          <input
            type="url"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            required
            className="w-full px-6 py-5 bg-gray-800/60 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
            <span className="text-gray-500 text-sm">https://</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!!status}
          className={`mt-8 w-full py-5 px-8 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
            status
              ? 'bg-gray-700 cursor-not-allowed text-gray-400'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:shadow-cyan-500/30 hover:scale-[1.02]'
          }`}
        >
          {status ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Indexing...
            </>
          ) : (
            <>
              Analyze Repository
              <span className="text-xl">⚡</span>
            </>
          )}
        </button>

        {status && !error && (
          <p className="mt-6 text-center text-cyan-400 font-medium animate-pulse tracking-wide">
            {status}
          </p>
        )}

        {error && (
          <div className="mt-6 bg-red-950/40 border border-red-800/50 rounded-xl p-4 text-red-300 text-center text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default RepoIndexer;

