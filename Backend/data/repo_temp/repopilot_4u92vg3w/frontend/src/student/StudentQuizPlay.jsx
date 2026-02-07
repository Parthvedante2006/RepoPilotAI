import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import ThemeToggle from "../components/ThemeToggle";
import { ArrowLeft } from "lucide-react";

import MCQGame from "./games/MCQGame";
import DragDropGame from "./games/DragDropGame";
import MemoryGame from "./games/MemoryGame";
import SequenceGame from "./games/SequenceGame";
import PracticeGame from "./games/PracticeGame";

export default function StudentQuizPlay() {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [gameType, setGameType] = useState(location.state?.gameType || "mcq");
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);

  const guestQuiz = location.state?.quiz;

  useEffect(() => {
    const loadQuiz = async () => {
      if (guestQuiz && guestQuiz.isGuest) {
        setQuiz({
          id: guestQuiz.id,
          name: guestQuiz.name,
          questions: guestQuiz.questions || guestQuiz.games?.mcq || [],
        });
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "quizzes", quizId));
        if (snap.exists()) {
          setQuiz({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error loading quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, guestQuiz]);

  const handleFinish = async (s) => {
    setScore(s);
    setFinished(true);

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const name = userSnap.exists() ? userSnap.data().name : "Anonymous";

      await addDoc(collection(db, "quiz_results"), {
        quizId,
        gameType,
        studentId: user.uid,
        studentName: name,
        score: s,
        total: quiz.questions.length,
        percentage: Math.round((s / quiz.questions.length) * 100),
        submittedAt: serverTimestamp(),
      });

      loadLeaderboard();
    } catch (err) {
      console.error("Error saving result:", err);
    }
  };

  const loadLeaderboard = async () => {
    setBoardLoading(true);
    try {
      const q = query(
        collection(db, "quiz_results"),
        where("quizId", "==", quizId),
        where("gameType", "==", gameType)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => d.data());
      data.sort((a, b) => b.score - a.score);
      setLeaderboard(data);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setBoardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-2xl text-red-600 dark:text-red-400">Quiz not found</p>
      </div>
    );
  }

  const GameComponent = {
    mcq: MCQGame,
    drag: DragDropGame,
    memory: MemoryGame,
    sequence: SequenceGame,
    practice: PracticeGame,
  }[gameType];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-0 md:px-0 relative">
      {/* Theme Toggle - Far right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Back Button */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-6 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>
      </div>

      {!finished ? (
        <div className="w-full">
          {/* Header - Full width */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold">{quiz.name}</h2>
            <p className="text-blue-100 text-sm md:text-base mt-1">
              Game Mode: {gameType.toUpperCase()}
            </p>
          </div>

          {/* Game Content - Full width */}
          <div className="w-full">
            <GameComponent questions={quiz.questions} onFinish={handleFinish} />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Game Complete!
            </h2>

            <div className="text-center mb-8">
              <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {score} / {quiz.questions.length}
              </p>
              <p className="text-2xl text-gray-700 dark:text-gray-300">
                {Math.round((score / quiz.questions.length) * 100)}% Correct
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 text-center">
              Leaderboard (Top 10)
            </h3>

            {boardLoading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">Loading...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Be the first on the leaderboard!
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {leaderboard.slice(0, 10).map((l, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-4 rounded-xl transition ${
                      l.studentId === auth.currentUser?.uid
                        ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 font-medium"
                        : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-base">
                      #{i + 1} {l.studentName}
                    </span>
                    <span className="text-base font-medium">
                      {l.score}/{l.total} ({l.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setFinished(false);
                  setScore(0);
                }}
                className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

