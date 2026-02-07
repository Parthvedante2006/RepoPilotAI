import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import ThemeToggle from "../components/ThemeToggle";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  MousePointer2,
  Clock,
  Puzzle,
  Trophy,
  Play,
  Calendar,
  User,
  Lock,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StudentClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [data, setData] = useState({});
  const [allowView, setAllowView] = useState({});
  const [expandedGame, setExpandedGame] = useState({});
  const [loading, setLoading] = useState(true);

  const gameTypes = ["mcq", "drag", "practice", "memory", "sequence"];

  const gameInfo = {
    mcq: { label: "Multiple Choice", icon: BookOpen },
    drag: { label: "Drag & Drop", icon: MousePointer2 },
    practice: { label: "Daily Practice", icon: Clock },
    memory: { label: "Memory Match", icon: Puzzle },
    sequence: { label: "Sequence", icon: Brain },
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const user = auth.currentUser;

        /* Class */
        const classSnap = await getDoc(doc(db, "classes", classId));
        if (!classSnap.exists()) return;
        const classData = classSnap.data();
        setCls({ id: classSnap.id, ...classData });

        /* Teacher */
        const teacherSnap = await getDoc(doc(db, "users", classData.teacherId));
        if (teacherSnap.exists()) setTeacher(teacherSnap.data());

        /* Assigned quizzes */
        const quizSnap = await getDocs(
          query(collection(db, "class_quizzes"), where("classId", "==", classId))
        );

        const quizList = quizSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuizzes(quizList);

        const finalData = {};
        const viewMap = {};

        for (const q of quizList) {
          /* Permission */
          if (user) {
            const permSnap = await getDoc(
              doc(db, `quiz_permissions/${q.quizId}/students/${user.uid}`)
            );
            viewMap[q.quizId] =
              permSnap.exists() && permSnap.data().allowView === true;
          }

          /* Quiz questions (from quizzes collection) */
          const quizDoc = await getDoc(doc(db, "quizzes", q.quizId));
          const questions = quizDoc.exists()
            ? quizDoc.data().questions || []
            : [];

          /* Results (score only from quiz_results) */
          const resultSnap = await getDocs(
            query(
              collection(db, "quiz_results"),
              where("quizId", "==", q.quizId),
              where("studentId", "==", user?.uid)
            )
          );

          const results = {};
          resultSnap.docs.forEach((d) => {
            const r = d.data();
            results[r.gameType] = {
              score: r.score,
              total: r.total,
              percentage: r.percentage,
            };
          });

          finalData[q.quizId] = { questions, results };
        }

        setAllowView(viewMap);
        setData(finalData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [classId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!cls) return <p className="text-center text-red-600 dark:text-red-400">Class not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Theme Toggle - Moved far right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Class Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-10 border border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {cls.name}
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 text-gray-600 dark:text-gray-400">
            {teacher && (
              <p className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Teacher: <span className="font-semibold text-gray-900 dark:text-white">{teacher.name}</span>
              </p>
            )}
            {cls.createdAt && (
              <p className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Created: {new Date(cls.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Assigned Quizzes</h2>

        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-6 text-gray-400 dark:text-gray-600">📚</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">
              No quizzes assigned yet
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Your teacher will assign quizzes soon. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {quizzes.map((q) => {
              const quizData = data[q.quizId];
              const canView = allowView[q.quizId];
              const attempted = Object.keys(quizData?.results || {});
              const remaining = gameTypes.filter((g) => !attempted.includes(g));

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                >
                  {/* Quiz Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <h3 className="text-xl font-bold">{q.quizName}</h3>
                  </div>

                  <div className="p-6">
                    {/* RESULTS - Only if allowed */}
                    {canView ? (
                      attempted.length > 0 ? (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Your Progress
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attempted.map((gt) => {
                              const { icon: Icon, label } = gameInfo[gt];
                              const key = `${q.quizId}_${gt}`;
                              const expanded = expandedGame[key];

                              // Use quiz questions (from quizzes collection)
                              const questions = quizData.questions || [];

                              // Shuffle and limit for memory game (as you had)
                              const displayQuestions =
                                gt === "memory"
                                  ? [...questions]
                                      .sort(() => Math.random() - 0.5)
                                      .slice(0, 5)
                                  : questions;

                              const res = quizData.results[gt] || {};

                              return (
                                <div key={gt}>
                                  <div
                                    onClick={() =>
                                      setExpandedGame((p) => ({
                                        ...p,
                                        [key]: !p[key],
                                      }))
                                    }
                                    className="cursor-pointer bg-gray-100 dark:bg-gray-800 p-5 rounded-xl text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
                                  >
                                    <Icon className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                                    <p className="font-bold text-gray-900 dark:text-white">{label}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {res.score || 0} / {res.total || 0} ({res.percentage || 0}%)
                                    </p>
                                    <ChevronDown
                                      className={`w-6 h-6 mx-auto mt-2 text-gray-500 dark:text-gray-400 transition-transform ${
                                        expanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>

                                  {expanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-3 bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700"
                                    >
                                      <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                                        Questions & Correct Answers
                                      </h5>

                                      {displayQuestions.length > 0 ? (
                                        <div className="space-y-5 max-h-96 overflow-y-auto">
                                          {displayQuestions.map((qq, i) => (
                                            <div
                                              key={i}
                                              className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-none"
                                            >
                                              <p className="font-medium text-gray-900 dark:text-white mb-2">
                                                Q{i + 1}: {qq.question || "Question missing"}
                                              </p>

                                              {qq.options && qq.options.length > 0 && (
                                                <ul className="list-disc pl-6 mb-3 text-sm text-gray-700 dark:text-gray-300">
                                                  {qq.options.map((o, j) => (
                                                    <li key={j}>{o}</li>
                                                  ))}
                                                </ul>
                                              )}

                                              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                Correct Answer: {qq.answer || "Not available"}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                                          No questions available for this game
                                        </p>
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400 py-6">
                          No games attempted yet
                        </p>
                      )
                    ) : (
                      <div className="text-center py-10">
                        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          Results locked by teacher
                        </p>
                      </div>
                    )}

                    {/* PLAY BUTTONS */}
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mt-8 mb-4">
                      Play Available Games
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {remaining.map((gt) => {
                        const { icon: Icon, label } = gameInfo[gt];
                        return (
                          <button
                            key={gt}
                            onClick={() =>
                              navigate(`/student/play/${q.quizId}`, {
                                state: { gameType: gt },
                              })
                            }
                            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-2"
                          >
                            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {label}
                            </span>
                            <Play className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </button>
                        );
                      })}
                    </div>

                    {remaining.length === 0 && attempted.length > 0 && (
                      <div className="text-center mt-8">
                        <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          All games completed 🎉
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


  