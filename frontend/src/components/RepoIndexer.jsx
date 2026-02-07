// src/components/RepoIndexer.jsx
import { useState } from 'react';

function RepoIndexer({ onIndex, status, error }) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onIndex(repoUrl.trim());
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transform transition-all hover:shadow-2xl"
      >
        <label htmlFor="repoUrl" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          GitHub Repository URL
        </label>
        <input
          type="url"
          id="repoUrl"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base placeholder-gray-500 dark:placeholder-gray-400 transition"
          placeholder="https://github.com/username/repository"
          required
        />
        <button
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!!status}
        >
          {status ? 'Indexing...' : 'Analyze Repository'}
        </button>

        {status && (
          <p className="mt-5 text-center text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-5 text-center text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default RepoIndexer;

