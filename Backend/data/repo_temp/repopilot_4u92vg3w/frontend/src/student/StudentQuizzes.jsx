import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  MousePointer2, 
  Clock, 
  Puzzle, 
  Trophy,
  Calendar
} from "lucide-react";

import MCQGame from "./games/MCQGame";
import DragDropGame from "./games/DragDropGame";
import MemoryGame from "./games/MemoryGame";
import SequenceGame from "./games/SequenceGame";
import PracticeGame from "./games/PracticeGame";

export default function StudentQuizzes() {
  const [items, setItems] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  const gameTypes = ["mcq", "drag", "practice", "memory", "sequence"];
  const gameInfo = {
    mcq: { label: "Multiple Choice", icon: BookOpen },
    drag: { label: "Drag & Drop", icon: MousePointer2 },
    practice: { label: "Daily Practice", icon: Clock },
    memory: { label: "Memory Match", icon: Puzzle },
    sequence: { label: "Sequence", icon: Brain },
  };

  const gameComponents = {
    mcq: MCQGame,
    drag: DragDropGame,
    practice: PracticeGame,
    memory: MemoryGame,
    sequence: SequenceGame,
  };

  useEffect(() => {
    if (!user) return;

    const loadAll = async () => {
      const finalList = [];

      // 1. Teacher-assigned quizzes
      const classSnap = await getDocs(
        query(collection(db, "class_students"), where("studentId", "==", user.uid))
      );
      const classIds = classSnap.docs.map(d => d.data().classId);

      if (classIds.length) {
        const classQuizSnap = await getDocs(collection(db, "class_quizzes"));

        for (const d of classQuizSnap.docs) {
          const quiz = { id: d.id, ...d.data() };
          if (!classIds.includes(quiz.classId)) continue;

          const teacherSnap = await getDoc(doc(db, "users", quiz.teacherId));

          const resultSnap = await getDocs(
            query(
              collection(db, "quiz_results"),
              where("quizId", "==", quiz.quizId),
              where("studentId", "==", user.uid)
            )
          );

          const byGame = {};
          resultSnap.docs.forEach(r => {
            const data = r.data();
            if (!byGame[data.gameType]) byGame[data.gameType] = [];
            byGame[data.gameType].push({
              ...data,
              submittedAt: data.submittedAt?.toDate(),
            });
          });

          // Sort latest first
          Object.keys(byGame).forEach(game => {
            byGame[game].sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
          });

          // Calculate rank for each game type
          for (const game of Object.keys(byGame)) {
            const allResultsSnap = await getDocs(
              query(
                collection(db, "quiz_results"),
                where("quizId", "==", quiz.quizId),
                where("gameType", "==", game)
              )
            );

            const allAttempts = allResultsSnap.docs.map(d => ({
              score: d.data().score,
              submittedAt: d.data().submittedAt?.toDate(),
              studentId: d.data().studentId,
            }));

            allAttempts.sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return (b.submittedAt || 0) - (a.submittedAt || 0);
            });

            const studentLatest = byGame[game][0];
            const rank = allAttempts.findIndex(
              a => a.studentId === user.uid && a.score === studentLatest.score && 
              a.submittedAt?.getTime() === studentLatest.submittedAt?.getTime()
            ) + 1;

            byGame[game][0].rank = rank || "N/A";
          }

          finalList.push({
            type: "teacher",
            quizId: quiz.quizId,
            classId: quiz.classId,
            quizName: quiz.quizName,
            teacherName: teacherSnap.exists() ? teacherSnap.data().name : "Teacher",
            leaderboards: byGame,
          });
        }
      }

      // 2. Practice quizzes (no rank needed)
      const practiceResultSnap = await getDocs(
        query(collection(db, "quiz_results"), where("studentId", "==", user.uid))
      );

      const practiceMap = {};
      practiceResultSnap.docs.forEach(d => {
        const r = d.data();
        if (!practiceMap[r.quizId]) practiceMap[r.quizId] = [];
        practiceMap[r.quizId].push(r);
      });

      for (const quizId of Object.keys(practiceMap)) {
        const quizSnap = await getDoc(doc(db, "quizzes", quizId));
        if (!quizSnap.exists()) continue;

        const byGame = {};
        practiceMap[quizId].forEach(r => {
          if (!byGame[r.gameType]) byGame[r.gameType] = [];
          byGame[r.gameType].push({
            ...r,
            submittedAt: r.submittedAt?.toDate(),
          });
        });

        Object.keys(byGame).forEach(game => {
          byGame[game].sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        });

        finalList.push({
          type: "practice",
          quizId,
          quizName: quizSnap.data().name,
          questions: quizSnap.data().questions,
          leaderboards: byGame,
        });
      }

      setItems(finalList);
    };

    loadAll();
  }, [user]);

  const handleQuizClick = (item) => {
    if (item.type === "teacher") {
      navigate(`/student/class/${item.classId}`, { state: { quizId: item.quizId } });
    } else {
      setSelectedQuiz(item);
      setSelectedGameType(null);
    }
  };

  const handleGameTypeClick = (gt) => {
    setSelectedGameType(gt);
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
    setSelectedGameType(null);
  };

  const handleBackToResults = () => {
    setSelectedGameType(null);
  };

  const SelectedGame = selectedGameType ? gameComponents[selectedGameType] : null;

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-6 relative">
  {/* Theme Toggle - Right side, but moved a little left from the edge */}
  <div className="fixed top-8 right-80 z-50">
    
  </div>

      <div className="max-w-5xl mx-auto">
        {selectedQuiz && selectedGameType ? (
          // Playing Game
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBackToResults}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-6 transition"
            >
              <ArrowLeft className="w-6 h-6" />
              Back to Results
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white mb-8">
              <h2 className="text-2xl font-bold">{selectedQuiz.quizName}</h2>
              <p className="text-blue-100 mt-1">Playing: {gameInfo[selectedGameType].label}</p>
            </div>

            <SelectedGame questions={selectedQuiz.questions} onFinish={() => {}} />
          </div>
        ) : selectedQuiz ? (
          // Selected Practice Quiz - Results + Game Buttons
          <div>
            <button
              onClick={handleBackToList}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-8 transition"
            >
              <ArrowLeft className="w-6 h-6" />
              Back to Quiz List
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                {selectedQuiz.quizName}
              </h2>

              {/* Latest Results */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Your Latest Scores
                </h3>
                {Object.keys(selectedQuiz.leaderboards || {}).length === 0 ? (
                  <p className="text-center text-lg text-gray-600 dark:text-gray-400 py-8">
                    No attempts yet — choose a game below to start!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {Object.entries(selectedQuiz.leaderboards || {}).map(([gt, attempts]) => {
                      const latest = attempts[0];
                      const Icon = gameInfo[gt].icon;
                      return (
                        <div key={gt} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5 text-center border border-gray-200 dark:border-gray-600">
                          <Icon className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{gameInfo[gt].label}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {latest.score}/{latest.total}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                            {latest.percentage}%
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {latest.submittedAt?.toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Game Selection */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Play a Game
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                  {gameTypes.map((gt) => {
                    const { label, icon: Icon } = gameInfo[gt];
                    return (
                      <button
                        key={gt}
                        onClick={() => handleGameTypeClick(gt)}
                        className="group bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-xl p-6 border border-gray-300 dark:border-gray-600 hover:border-blue-500 transition flex flex-col items-center gap-3"
                      >
                        <Icon className="w-10 h-10 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Main Quiz List
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
              My Quiz History
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  No quiz activity yet. Join a class or create a practice quiz!
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {items.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => handleQuizClick(q)}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {q.quizName}
                      </h3>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {q.type === "teacher" ? `By ${q.teacherName}` : "Practice Quiz"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.keys(q.leaderboards || {}).map(game => {
                        const latest = q.leaderboards[game][0];
                        const Icon = gameInfo[game].icon;
                        return (
                          <div key={game} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
                            <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{gameInfo[game].label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {latest.score}/{latest.total}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                              {latest.percentage}%
                            </p>
                            {q.type === "teacher" && latest.rank && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
                                Rank #{latest.rank}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

