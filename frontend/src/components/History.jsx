// src/components/History.jsx
function History() {
  const dummyHistory = [
    { repo: 'facebook/react', date: 'Feb 2, 2026', queries: 28, status: 'Synced', size: '4.1 MB' },
    { repo: 'vercel/next.js', date: 'Jan 29, 2026', queries: 41, status: 'Indexed', size: '6.8 MB' },
    { repo: 'tailwindlabs/tailwindcss', date: 'Jan 25, 2026', queries: 19, status: 'Synced', size: '2.3 MB' },
    { repo: 'mui/material-ui', date: 'Jan 20, 2026', queries: 15, status: 'Indexed', size: '5.2 MB' },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        History
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dummyHistory.map((item, i) => (
          <div 
            key={i} 
            className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold group-hover:text-cyan-400 transition-colors">
                  {item.repo}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{item.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.status === 'Synced' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {item.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Queries</p>
                <p className="font-medium">{item.queries}</p>
              </div>
              <div>
                <p className="text-gray-400">Size</p>
                <p className="font-medium">{item.size}</p>
              </div>
            </div>
            <button className="mt-6 w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-xl text-sm font-medium transition">
              Open Conversation →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;


