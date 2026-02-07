import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import ThemeToggle from "../components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Brain, MousePointer2, Clock, Puzzle, Play } from "lucide-react";

export default function CreateQuiz() {
  const [pdf, setPdf] = useState(null);
  const [text, setText] = useState("");
  const [quizName, setQuizName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const [questions, setQuestions] = useState([]);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const gameTypes = ["mcq", "drag", "practice", "memory", "sequence"];
  const gameInfo = {
    mcq: { label: "Multiple Choice", icon: BookOpen },
    drag: { label: "Drag & Drop", icon: MousePointer2 },
    practice: { label: "Practice", icon: Clock },
    memory: { label: "Memory Match", icon: Puzzle },
    sequence: { label: "Sequence", icon: Brain },
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const loadMyQuizzes = async () => {
      try {
        const q = query(
          collection(db, "quizzes"),
          where("createdBy", "==", auth.currentUser.uid),
          where("createdByRole", "==", "student")
        );
        const snap = await getDocs(q);
        setCreatedQuizzes(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            questions: d.data().questions,
            createdAt: d.data().createdAt?.toDate(),
          }))
        );
      } catch (err) {
        console.error("Error loading quizzes:", err);
      }
    };

    loadMyQuizzes();
  }, []);

  useEffect(() => {
    if (!selectedQuiz || !auth.currentUser) return;

    const loadLatestResults = async () => {
      const resultsData = {};
      for (const gt of gameTypes) {
        const resultQuery = query(
          collection(db, "quiz_results"),
          where("quizId", "==", selectedQuiz.id),
          where("studentId", "==", auth.currentUser.uid),
          where("gameType", "==", gt)
        );
        const resultSnap = await getDocs(resultQuery);
        if (!resultSnap.empty) {
          const latest = resultSnap.docs
            .map(d => d.data())
            .sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0))[0];

          const lbQuery = query(
            collection(db, "quiz_results"),
            where("quizId", "==", selectedQuiz.id),
            where("gameType", "==", gt)
          );
          const lbSnap = await getDocs(lbQuery);
          const lb = lbSnap.docs.map(d => d.data());
          lb.sort((a, b) => b.score - a.score);
          const rank = lb.findIndex(l => l.studentId === auth.currentUser.uid && l.submittedAt?.toMillis() === latest.submittedAt?.toMillis()) + 1;

          resultsData[gt] = {
            score: latest.score,
            total: latest.total,
            percentage: latest.percentage,
            rank: rank || "N/A",
          };
        }
      }
      setQuizResults(prev => ({ ...prev, [selectedQuiz.id]: resultsData }));
    };

    loadLatestResults();
  }, [selectedQuiz]);

  const generateQuiz = async () => {
    if (!quizName.trim()) return setError("Please enter a quiz name");

    try {
      setLoading(true);
      setError("");
      setSuccess("");

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

      setQuestions(data.games.mcq.slice(0, 20));
      setSuccess("Quiz questions generated successfully!");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    if (!questions.length) return setError("Generate questions first");

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const ref = await addDoc(collection(db, "quizzes"), {
        name: quizName,
        questions,
        difficulty,
        createdBy: auth.currentUser.uid,
        createdByRole: "student",
        createdAt: serverTimestamp(),
      });

      setCreatedQuizzes((prev) => [
        { id: ref.id, name: quizName, createdAt: new Date() },
        ...prev,
      ]);

      setPdf(null);
      setText("");
      setQuizName("");
      setQuestions([]);

      setSuccess("Practice quiz saved! Click to play anytime.");
    } catch (e) {
      setError("Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-6 relative">
      {/* Theme Toggle - Right side, but moved a little left from the edge */}
      <div className="fixed top-8 right-80 z-50">
       
      </div>

      

      <div className="max-w-5xl mx-auto">
        {selectedQuiz ? (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setSelectedQuiz(null)}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-6 transition"
            >
              <ArrowLeft className="w-6 h-6" />
              Back to Practice Quizzes
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {selectedQuiz.name}
              </h2>

              {/* Latest Results */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                  Latest Results
                </h3>
                {Object.keys(quizResults[selectedQuiz.id] || {}).length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No attempts yet — start playing below!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {Object.entries(quizResults[selectedQuiz.id] || {}).map(([gt, res]) => {
                      const Icon = gameInfo[gt].icon;
                      return (
                        <div key={gt} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 text-center border border-gray-200 dark:border-gray-600">
                          <Icon className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{gameInfo[gt].label}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {res.score}/{res.total}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            {res.percentage}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Play Games */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                  Play Any Game
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                  {gameTypes.map((gt) => {
                    const { label, icon: Icon } = gameInfo[gt];
                    return (
                      <button
                        key={gt}
                        onClick={() => navigate(`/student/play/${selectedQuiz.id}`, { state: { gameType: gt, quizName: selectedQuiz.name } })}
                        className="p-5 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-blue-500 transition flex flex-col items-center gap-2"
                      >
                        <Icon className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                        <Play className="w-5 h-5 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Create Quiz Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-12 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Create Practice Quiz
              </h2>

              {error && <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 text-red-700 dark:text-red-300 rounded-xl text-center">{error}</div>}
              {success && <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/30 border border-green-300 text-green-700 dark:text-green-300 rounded-xl text-center">{success}</div>}

              <input
                placeholder="Quiz Name (required)"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
              />

              <div className="mb-5">
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">Upload PDF (optional)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white" />
              </div>

              <div className="mb-5">
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">Or Paste Text (optional)</label>
                <textarea
                  rows="4"
                  placeholder="Describe the topic..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                onClick={generateQuiz}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white text-lg font-bold rounded-xl shadow-lg transition"
              >
                {loading ? "Generating..." : "Generate Quiz Questions"}
              </button>

              {questions.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4">{questions.length} questions generated!</p>
                  <button
                    onClick={saveQuiz}
                    className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-bold rounded-xl shadow-lg transition"
                  >
                    Save & Play
                  </button>
                </div>
              )}
            </div>

            {/* My Practice Quizzes */}
            <div>
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                My Practice Quizzes
              </h3>

              {createdQuizzes.length === 0 ? (
                <p className="text-center text-lg text-gray-600 dark:text-gray-400">
                  No practice quizzes created yet. Generate one above!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdQuizzes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuiz(q)}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-2xl hover:scale-105 transition"
                    >
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {q.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Created: {q.createdAt?.toLocaleDateString() || "N/A"}
                      </p>
                      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
                        View & Play
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

