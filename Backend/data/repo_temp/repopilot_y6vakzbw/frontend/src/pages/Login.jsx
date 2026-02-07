import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const provider = new GoogleAuthProvider();

  const redirectBasedOnRole = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const role = snap.data().role;
        navigate(role === "teacher" ? "/teacher" : "/student");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error checking role:", err);
      navigate("/");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await redirectBasedOnRole(userCred.user.uid);
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, provider);
      await redirectBasedOnRole(result.user.uid);
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-500">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
        {/* Left - Branding (Hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 lg:p-16 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="text-center max-w-md">
            <h2 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Welcome Back!
            </h2>
            <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-10">
              Continue your learning journey with QuizMaster
            </p>
            <div className="text-9xl animate-bounce">🎮📚</div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg mx-auto w-full">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Sign In
            </h2>
            <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-10">
              Access your personalized learning dashboard
            </p>

            {error && (
              <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300 rounded-2xl text-center text-base shadow-sm">
                {error}
              </div>
            )}

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-gray-800 dark:text-white text-lg shadow-md mb-8 transform hover:scale-[1.02] active:scale-100 disabled:opacity-60"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-7 h-7"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <span className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition pr-24"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold text-xl rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center mt-10 text-gray-600 dark:text-gray-400 text-base">
              New here?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

