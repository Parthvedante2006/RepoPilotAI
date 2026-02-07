// src/App.jsx
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import History from './components/History';
import LoginModal from './components/LoginModal';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [repoUrl, setRepoUrl] = useState('');
  const [isIndexed, setIsIndexed] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage 
          onGetStarted={() => setShowLogin(true)} 
          onAnalyze={(url) => {
            setRepoUrl(url);
            setIsLoggedIn(true); // auto-login for guest analyze
            setIsIndexed(false);
          }}
        />
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            repoUrl={repoUrl} 
            setRepoUrl={setRepoUrl} 
            isIndexed={isIndexed} 
            setIsIndexed={setIsIndexed} 
          />
        )}
        {activeTab === 'history' && <History />}
        {/* Explorer tab placeholder */}
        {activeTab === 'explorer' && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">File Explorer</h2>
            <p className="text-gray-400">Coming soon – full repo file tree view</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;




