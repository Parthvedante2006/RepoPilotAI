// src/components/Dashboard.jsx
import RepoIndexer from './RepoIndexer';
import ChatInterface from './ChatInterface';
import { useState } from 'react';


function Dashboard({ repoUrl, setRepoUrl, isIndexed, setIsIndexed }) {
  const [indexingStatus, setIndexingStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleIndex = async (url) => {
    setRepoUrl(url);
    setIndexingStatus('Indexing repository...');
    setError(null);
    try {
      const res = await fetch('http://localhost:5001/index_repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url }),
      });
      const data = await res.json();
      if (data.success) {
        setIsIndexed(true);
        setIndexingStatus('Ready to chat!');
      } else {
        setError(data.message || 'Failed to index');
      }
    } catch (err) {
      setError('Backend connection failed');
    } finally {
      setIndexingStatus(null);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Indexed', value: '142', trend: '+18 this week', color: 'cyan' },
          { label: 'Storage Used', value: '5.8 GB', trend: 'of 20 GB', color: 'blue' },
          { label: 'Tokens Used', value: '1.2M', trend: '+320K today', color: 'purple' },
          { label: 'Active Syncs', value: '4', trend: '/5', color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'blue' ? 'text-blue-400' : stat.color === 'purple' ? 'text-purple-400' : 'text-green-400'}`}>
              {stat.value}
            </p>
            <p className="text-sm mt-1 opacity-80">{stat.trend}</p>
          </div>
        ))}
      </div>

      {!isIndexed ? (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Index a New Repository</h2>
          <RepoIndexer onIndex={handleIndex} status={indexingStatus} error={error} bigVersion={true} />
        </div>
      ) : (
        <ChatInterface repoName={repoUrl.split('/').slice(-2).join('/')} />
      )}
    </div>
  );
}

export default Dashboard;

