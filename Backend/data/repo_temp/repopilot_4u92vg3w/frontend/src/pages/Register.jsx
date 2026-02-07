import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const provider = new GoogleAuthProvider();

  const isGoogleFirstTime = location.state?.fromGoogle;
  const googleUid = location.state?.uid;

  const validate = () => {
    if (!name.trim()) return "Please enter your name.";
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum <= 0) return "Please enter a valid age.";
    if (!school.trim()) return "Please enter your school/college.";
    if (!isGoogleFirstTime) {
      if (!email.includes("@")) return "Valid email required.";
      if (password.length < 6) return "Password must be 6+ characters.";
    }
    return "";
  };

  const saveUserProfile = async (uid) => {
    await setDoc(doc(db, "users", uid), {
      name: name.trim(),
      age: Number(age),
      school: school.trim(),
      role,
      email: email || auth.currentUser?.email,
      createdAt: new Date(),
    });
    navigate(role === "teacher" ? "/teacher" : "/student");
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserProfile(userCred.user.uid);
    } catch (err) {
      setError("Email already in use or weak password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      let user;
      if (isGoogleFirstTime && googleUid) {
        user = auth.currentUser;
      } else {
        const result = await signInWithPopup(auth, provider);
        user = result.user;

        const existing = await getDoc(doc(db, "users", user.uid));
        if (existing.exists()) {
          const role = existing.data().role;
          navigate(role === "teacher" ? "/teacher" : "/student");
          return;
        }
      }
    } catch (err) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    try {
      setLoading(true);
      const uid = googleUid || auth.currentUser?.uid;
      if (!uid) throw new Error("Not authenticated");
      await saveUserProfile(uid);
    } catch (err) {
      setError("Failed to save profile.");
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

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 border border-white/20 dark:border-gray-700/50 transition-colors">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          {isGoogleFirstTime ? "Complete Your Profile" : "Create Your Account"}
        </h2>
        <p className="text-center text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10">
          {isGoogleFirstTime ? "Just a few details to get started" : "Join thousands mastering their subjects"}
        </p>

        {error && (
          <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300 rounded-2xl text-center shadow-sm">
            {error}
          </div>
        )}

        {!isGoogleFirstTime && (
          <>
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-gray-800 dark:text-white text-lg shadow-md mb-8 transform hover:scale-[1.02] active:scale-100 disabled:opacity-60"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-7 h-7" />
              Continue with Google
            </button>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <span className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
          </>
        )}

        <form onSubmit={isGoogleFirstTime ? handleFinalSubmit : handleEmailRegister} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                Age
              </label>
              <input
                type="number"
                placeholder="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
              School / College
            </label>
            <input
              type="text"
              placeholder="Your institution name"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
              required
            />
          </div>

          {!isGoogleFirstTime && (
            <>
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="6+ characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 pr-32 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold text-xl rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
                {isGoogleFirstTime ? "Completing..." : "Creating Account..."}
              </>
            ) : isGoogleFirstTime ? (
              "Complete Profile"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {!isGoogleFirstTime && (
          <p className="text-center mt-10 text-gray-600 dark:text-gray-400 text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}


