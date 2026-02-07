// src/components/LoginModal.jsx
import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

function LoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username or email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay (fake auth)
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(); // success → close modal & log in
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-gray-700/70 shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="pt-10 pb-6 px-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 mt-2">
            {isSignup
              ? 'Join RepoPilot and explore repositories faster'
              : 'Sign in to continue your AI-powered repo journey'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          {/* Username / Email */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              placeholder="ruturaj.dadas / ruturaj@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full bg-gray-800/70 border ${
                error && !username.trim() ? 'border-red-500' : 'border-gray-700'
              } rounded-xl px-4 py-3.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-800/70 border ${
                  error && !password.trim() ? 'border-red-500' : 'border-gray-700'
                } rounded-xl px-4 py-3.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/30 border border-red-800/50 rounded-lg py-2 px-4">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isSignup ? 'Creating account...' : 'Signing in...'}
              </>
            ) : isSignup ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer toggle */}
        <div className="px-8 pb-8 text-center text-gray-400 border-t border-gray-800/50 pt-6">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Create one
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;


