import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import Chatbot from "../components/Chatbot";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { 
  Upload, Sparkles, Brain, Target, BarChart3, ArrowRight, 
  Zap, Users, BookOpen, Shield, Smartphone, Star, TrendingUp,
  Trophy, Clock, Lightbulb, Rocket, Globe, Heart, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [pdf, setPdf] = useState(null);
  const [text, setText] = useState("");
  const [quizName, setQuizName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const generateGuestQuiz = async () => {
    if (!quizName.trim()) {
      setError("Please enter a quiz name");
      return;
    }
    if (!pdf && !text.trim()) {
      setError("Please upload a PDF or enter some text");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      if (pdf) formData.append("file", pdf);
      if (text.trim()) formData.append("extraText", text.trim());
      formData.append("difficulty", difficulty);

      const res = await fetch("http://127.0.0.1:5001/upload-pdf-generate-games", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");

      const guestId = Date.now().toString();
      const tempQuiz = {
        id: guestId,
        name: quizName,
        questions: data.games.mcq.slice(0, 20),
        games: data.games,
        isGuest: true,
      };

      navigate(`/play/${guestId}`, { state: { quiz: tempQuiz } });
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Brain, title: "Advanced AI Engine", description: "State-of-the-art AI trained on millions of educational documents for precise, curriculum-aligned questions." },
    { icon: Target, title: "5 Interactive Game Modes", description: "Multiple Choice, Drag & Drop, Memory Match, Sequence Challenge, and Daily Practice — proven to boost retention." },
    { icon: BarChart3, title: "Real-Time Analytics", description: "Detailed performance tracking, leaderboards, weak area identification, and progress reports." },
    { icon: Users, title: "Full Class Management", description: "Create unlimited classes, assign quizzes, monitor attendance, track individual and group performance." },
    { icon: Trophy, title: "Gamified Learning", description: "Points, badges, streaks, and competitions that make learning addictive and fun." },
    { icon: Clock, title: "Adaptive Difficulty", description: "AI adjusts question difficulty based on student performance for optimal challenge." },
    { icon: Shield, title: "Enterprise-Grade Security", description: "Bank-level encryption, GDPR compliant, full data privacy — trusted by schools worldwide." },
    { icon: Smartphone, title: "Works Everywhere", description: "Fully responsive design — perfect on phones, tablets, laptops, and desktops." },
    { icon: Globe, title: "Multilingual Support", description: "Available in English, Hindi, Marathi, and more languages coming soon." },
  ];

  const stats = [
    { value: "100K+", label: "Questions Generated", icon: Sparkles },
    { value: "25K+", label: "Active Users", icon: Users },
    { value: "98%", label: "Satisfaction Rate", icon: Heart },
    { value: "4.9★", label: "Average Rating", icon: Star },
    { value: "500+", label: "Schools Using", icon: BookOpen },
    { value: "30%", label: "Avg Grade Improvement", icon: TrendingUp },
  ];

  const howItWorks = [
    { step: "01", title: "Upload Your Material", description: "PDF notes, textbook chapters, or paste any text — our AI understands it all" },
    { step: "02", title: "AI Analyzes & Creates", description: "Advanced AI extracts key concepts and generates high-quality, varied questions" },
    { step: "03", title: "Choose Your Game", description: "Pick from 5 engaging modes — perfect for different learning styles" },
    { step: "04", title: "Play, Learn, Improve", description: "Have fun while mastering the material with instant feedback and analytics" },
  ];

  const faqs = [
    { q: "Is QuizMaster really free?", a: "Yes! All core features are completely free forever." },
    { q: "How accurate are the generated questions?", a: "Our AI is trained on vast educational datasets and produces questions comparable to expert teachers." },
    { q: "Can I use it for competitive exams?", a: "Absolutely! Thousands of students use it for JEE, NEET, UPSC, and other competitive exams." },
    { q: "Does it support Indian curriculum?", a: "Yes! Fully aligned with CBSE, ICSE, State boards, and international curricula." },
    { q: "Can multiple teachers use it?", a: "Yes! Each teacher has their own dashboard, classes, and analytics." },
    { q: "Is there a mobile app?", a: "Our web app is fully mobile-optimized. Native apps coming soon!" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto px-4 lg:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-0.5"
            >
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              QuizMaster
            </motion.span>
          </Link>

          {/* Navigation - Large screens */}
          <nav className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              How It Works
            </a>
            <a href="#faq" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              FAQ
            </a>
            <a href="#try" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Try Now
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              to="/login"
              className="px-8 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-semibold text-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-blue-500/60 transition transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-48 pb-40 px-6 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 text-xl font-bold mb-12 shadow-2xl"
          >
            <Zap className="w-8 h-8 animate-pulse" />
            The Future of Learning is Here
            <Rocket className="w-8 h-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl md:text-8xl font-extrabold text-gray-900 dark:text-white mb-12 leading-tight"
          >
            Master Any Subject<br />
            <motion.span
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "200%", "0%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200%" }}
            >
              With AI-Powered Games
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 max-w-5xl mx-auto mb-20"
          >
            Upload your notes, let our AI create perfect quizzes, and learn through 5 engaging game modes proven to increase retention by 300%.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-10 justify-center"
          >
            <Link
              to="/register"
              className="group px-16 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-3xl font-bold rounded-full shadow-2xl hover:shadow-blue-500/70 transition transform hover:scale-110 flex items-center justify-center gap-6"
            >
              Start Free Today
              <ArrowRight className="w-10 h-10 group-hover:translate-x-4 transition" />
            </Link>
            <a
              href="#try"
              className="px-16 py-8 bg-white dark:bg-gray-800 border-6 border-blue-600 text-blue-600 dark:text-blue-400 text-3xl font-bold rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow-2xl"
            >
              Try Without Account
            </a>
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <stat.icon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  {stat.value}
                </div>
                <div className="text-xl text-gray-700 dark:text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-32"
          >
            <h2 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-8">
              Everything You Need to Excel
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Powerful tools designed by educators and backed by learning science
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -20, scale: 1.05 }}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-500"
              >
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-10 mx-auto group-hover:scale-110 transition"
                >
                  <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  {feature.title}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-40 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-black px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-32"
          >
            <h2 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-8">
              Simple Yet Powerful Process
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              From content to mastery in four easy steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-12">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-8xl font-extrabold text-blue-200 dark:text-blue-800 mb-10 group-hover:text-blue-400 transition"
                >
                  {item.step}
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {item.title}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-40 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-black px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-32">
            <h2 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Everything you need to know before getting started
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition"
              >
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {faq.q}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Try Now */}
      <section id="try" className="py-48 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-center mb-24"
          >
            <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-10">
              Experience the Magic Now
            </h2>
            <p className="text-3xl text-gray-600 dark:text-gray-400">
              Create your first AI-powered quiz in seconds — completely free
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-3xl p-20 border-8 border-blue-200 dark:border-blue-900/50"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-12 p-8 bg-red-50 dark:bg-red-900/30 border-4 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-2xl text-center text-2xl"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-16">
              <div>
                <label className="block text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  Give Your Quiz a Name
                </label>
                <input
                  placeholder="e.g., Class 10 Physics - Motion Chapter"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="w-full px-12 py-8 border-4 border-blue-300 dark:border-blue-700 rounded-3xl text-2xl text-center focus:outline-none focus:ring-8 focus:ring-blue-500 transition"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-16">
                <div>
                  <label className="block text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    Upload Your Study Material
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-80 border-8 border-dashed border-blue-400 dark:border-blue-600 rounded-3xl cursor-pointer hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition group">
                    <Upload className="w-24 h-24 text-blue-600 dark:text-blue-400 mb-8 group-hover:scale-110 transition" />
                    <span className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-4">
                      {pdf ? pdf.name : "Drop PDF here or click to browse"}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-500">
                      Supports up to 100MB files
                    </span>
                    <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0] || null)} className="hidden" />
                  </label>
                  {pdf && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 text-2xl text-green-600 dark:text-green-400 text-center font-bold"
                    >
                      ✓ {pdf.name} ready!
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    Or Paste Your Content
                  </label>
                  <textarea
                    rows={12}
                    placeholder="Paste chapter summary, key points, formulas, or any text you want to learn..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-12 py-10 border-4 border-blue-300 dark:border-blue-700 rounded-3xl text-xl focus:outline-none focus:ring-8 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="text-center">
                <label className="block text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Choose Difficulty Level
                </label>
                <div className="flex justify-center gap-12">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-16 py-8 rounded-3xl text-2xl font-bold transition transform hover:scale-110 ${
                        difficulty === level
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateGuestQuiz}
                  disabled={loading}
                  className="px-40 py-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-70 text-white text-4xl font-extrabold rounded-full shadow-3xl transition transform"
                >
                  {loading ? "Creating Your Quiz..." : "Generate & Play Quiz Now ✨"}
                </motion.button>
              </div>

              <div className="text-center space-y-4">
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  Instant • Free • No Account Required • Full Experience
                </p>
                <div className="flex justify-center gap-8 mt-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-xl">All 5 Game Modes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-xl">Instant Results</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-xl">Unlimited Attempts</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-24 shadow-3xl"
          >
            <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-12">
              Join the Learning Revolution Today
            </h2>
            <p className="text-3xl text-white/90 mb-16 max-w-4xl mx-auto">
              Thousands of students and teachers are already achieving better results with QuizMaster
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-8 px-20 py-10 bg-white text-blue-600 text-4xl font-extrabold rounded-full shadow-3xl hover:shadow-white/50 transition transform hover:scale-110"
            >
              Start Your Free Journey
              <ArrowRight className="w-12 h-12" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-gray-200 dark:border-gray-800">
        <p className="text-2xl text-gray-600 dark:text-gray-400">
          © 2026 QuizMaster • Transforming Education Across India and Beyond
        </p>
      </footer>

      <Chatbot />
    </div>
  );
}

