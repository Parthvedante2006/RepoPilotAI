import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import ThemeToggle from "../components/ThemeToggle";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Trophy, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Trash2 
} from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
} from "chart.js";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title
);

export default function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizDetails, setQuizDetails] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [sortOptions, setSortOptions] = useState({});
  const [studentPermissions, setStudentPermissions] = useState({}); // { quizId: { studentId: boolean } }
  const [expandedStudent, setExpandedStudent] = useState({}); // { quizId: studentId } for showing per-game scores

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const gameTypes = ["mcq", "drag", "practice", "memory", "sequence"];
  const gameLabels = {
    mcq: "Multiple Choice",
    drag: "Drag & Drop",
    practice: "Daily Practice",
    memory: "Memory Match",
    sequence: "Sequence",
  };

  const sharpBlue = "#3b82f6";
  const sharpBlueDark = "#2563eb";
  const sharpBlueLight = "#60a5fa";
  const darkGray = "#4b5563";

  const chartTextColor = isDarkMode ? "#e5e7eb" : "#111827";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classSnap = await getDoc(doc(db, "classes", classId));
        if (!classSnap.exists()) return;
        const classData = { id: classSnap.id, ...classSnap.data() };
        setCls(classData);

        const studentsQuery = query(
          collection(db, "class_students"),
          where("classId", "==", classId)
        );
        const studentsSnap = await getDocs(studentsQuery);
        const studentIds = studentsSnap.docs.map((d) => d.data().studentId);
        const studentMap = {};
        for (const sid of studentIds) {
          const studentDoc = await getDoc(doc(db, "users", sid));
          if (studentDoc.exists()) {
            studentMap[sid] = studentDoc.data().name || "Student";
          }
        }
        setStudents(studentMap);

        const quizzesQuery = query(
          collection(db, "class_quizzes"),
          where("classId", "==", classId)
        );
        const quizzesSnap = await getDocs(quizzesQuery);
        const history = quizzesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuizHistory(history);

        const details = {};
        for (const h of history) {
          const quizSnap = await getDoc(doc(db, "quizzes", h.quizId));
          if (quizSnap.exists()) details[h.quizId] = quizSnap.data();
        }
        setQuizDetails(details);

        const allResults = {};
        const permissions = {};
        for (const h of history) {
          const quizResults = {};
          for (const gt of gameTypes) {
            const resultsQuery = query(
              collection(db, "quiz_results"),
              where("quizId", "==", h.quizId),
              where("gameType", "==", gt)
            );
            const resultsSnap = await getDocs(resultsQuery);
            quizResults[gt] = resultsSnap.docs.map((d) => d.data());
          }
          allResults[h.quizId] = quizResults;

          // Fetch per-student permissions
          permissions[h.quizId] = {};
          for (const sid of Object.keys(studentMap)) {
            const permDoc = await getDoc(doc(db, `quiz_permissions/${h.quizId}/students/${sid}`));
            permissions[h.quizId][sid] = permDoc.exists() ? permDoc.data().allowView : false;
          }
        }
        setResults(allResults);
        setStudentPermissions(permissions);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Failed to load class data. Check console.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const toggleQuiz = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const handleDeleteQuiz = async (quizId, assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This cannot be undone.")) {
      return;
    }

    try {
      setDeletingQuizId(quizId);
      await deleteDoc(doc(db, "class_quizzes", assignmentId));
      await deleteDoc(doc(db, "quizzes", quizId));
      alert("Quiz deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting quiz: " + err.message);
    } finally {
      setDeletingQuizId(null);
    }
  };

  const toggleStudentView = async (quizId, studentId) => {
    const current = studentPermissions[quizId]?.[studentId] || false;
    try {
      await setDoc(doc(db, `quiz_permissions/${quizId}/students/${studentId}`), {
        allowView: !current,
        studentId,
        quizId,
        updatedAt: new Date(),
      }, { merge: true });

      setStudentPermissions(prev => ({
        ...prev,
        [quizId]: {
          ...prev[quizId],
          [studentId]: !current
        }
      }));
    } catch (err) {
      console.error("Permission update error:", err);
      alert("Error updating permission: " + err.message);
    }
  };

  const toggleStudentDetails = (quizId, studentId) => {
    setExpandedStudent(prev => ({
      ...prev,
      [quizId]: prev[quizId] === studentId ? null : studentId
    }));
  };

  const getSortedStudentsForQuiz = (quizId) => {
    const sort = sortOptions[quizId] || "marks";

    const studentAverages = Object.entries(students).map(([sid, name]) => {
      let totalScore = 0;
      let totalPercentage = 0;
      let gameCount = 0;

      gameTypes.forEach((gt) => {
        const attempts = results[quizId]?.[gt] || [];
        const studentAttempt = attempts.find(r => r.studentId === sid);
        if (studentAttempt) {
          totalScore += studentAttempt.score || 0;
          totalPercentage += studentAttempt.percentage || 0;
          gameCount++;
        }
      });

      const avgPercentage = gameCount > 0 ? Math.round(totalPercentage / gameCount) : 0;
      return {
        studentId: sid,
        name,
        avgPercentage,
        totalScore,
      };
    });

    if (sort === "marks") {
      studentAverages.sort((a, b) => b.avgPercentage - a.avgPercentage);
    } else {
      studentAverages.sort((a, b) => a.name.localeCompare(b.name));
    }

    return studentAverages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Zap className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <p className="text-2xl text-red-600 dark:text-red-400">Class not found</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false,
        labels: { color: chartTextColor }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" },
        ticks: { color: chartTextColor },
      },
      x: {
        grid: { display: false },
        ticks: { color: chartTextColor },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black py-8 px-6 relative transition-colors duration-300">
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-6 py-4 rounded-2xl shadow-xl border border-gray-200 dark:border-[#3b82f6]/30 hover:border-blue-500 dark:hover:border-[#3b82f6] transition z-50"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-[#3b82f6]" />
        <span className="font-medium text-gray-700 dark:text-[#3b82f6]">Back</span>
      </motion.button>

      <div className="max-w-7xl mx-auto">
        {/* Class Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-200 dark:border-[#3b82f6]/30 mb-16 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-[#1e40af]/10 dark:to-[#3b82f6]/10"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#60a5fa] dark:to-[#3b82f6] bg-clip-text text-transparent mb-8">
              {cls.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Header cards unchanged */}
            </div>
          </div>
        </motion.div>

        {/* Assigned Quizzes */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#60a5fa] dark:to-[#3b82f6] bg-clip-text text-transparent mb-12"
        >
          Assigned Quizzes ({quizHistory.length})
        </motion.h2>

        {quizHistory.length === 0 ? (
          <motion.div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-24 text-center border border-gray-200 dark:border-[#3b82f6]/30">
            <Trophy className="w-32 h-32 text-gray-400 dark:text-yellow-400 mx-auto mb-8" />
            <p className="text-3xl text-gray-600 dark:text-gray-300">No quizzes assigned yet</p>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {quizHistory.map((h, index) => {
              const quiz = quizDetails[h.quizId] || {};
              const totalStudents = Object.keys(students).length;

              const averageScores = gameTypes.map((gt) => {
                const attempts = results[h.quizId]?.[gt] || [];
                if (attempts.length === 0) return 0;
                const avg = attempts.reduce((sum, r) => sum + (r.percentage || 0), 0) / attempts.length;
                return Math.round(avg);
              });

              const totalPlayed = gameTypes.reduce((sum, gt) => sum + (results[h.quizId]?.[gt]?.length || 0), 0);
              const overallPlayed = totalPlayed;
              const overallNotPlayed = totalStudents * gameTypes.length - totalPlayed;

              const topPerformers = gameTypes
                .flatMap((gt) => (results[h.quizId]?.[gt] || []).map((r) => ({ ...r, gameType: gt })))
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 5);

              const lineData = {
                labels: gameTypes.map((gt) => gameLabels[gt]),
                datasets: [{
                  data: averageScores,
                  borderColor: sharpBlue,
                  backgroundColor: "rgba(59, 130, 246, 0.25)",
                  borderWidth: 4,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: sharpBlue,
                  pointRadius: 6,
                }],
              };

              const barData = {
                labels: gameTypes.map((gt) => gameLabels[gt]),
                datasets: [{
                  data: averageScores,
                  backgroundColor: sharpBlue,
                  borderColor: sharpBlueDark,
                  borderWidth: 0,
                  borderRadius: 0,
                }],
              };

              const donutShadowPlugin = {
                id: "donutShadow",
                beforeDatasetDraw(chart) {
                  const { ctx } = chart;
                  ctx.save();
                  ctx.shadowColor = "rgba(0,0,0,0.35)";
                  ctx.shadowBlur = 18;
                  ctx.shadowOffsetY = 10;
                },
                afterDatasetDraw(chart) {
                  chart.ctx.restore();
                },
              };

              const played = overallPlayed;
              const notPlayed = overallNotPlayed > 0 ? overallNotPlayed : 1;
              const isPlayedBig = played >= notPlayed;

              const doughnutData = {
                labels: ["Played", "Not Played"],
                datasets: [
                  {
                    data: [played, notPlayed],
                    backgroundColor: [sharpBlue, "#6b7280"],
                    borderWidth: 0,
                    cutout: "72%",
                    rotation: -90,
                    circumference: 360,
                    offset: (ctx) => {
                      if (ctx.dataIndex === 0 && isPlayedBig) return 38;
                      if (ctx.dataIndex === 1 && !isPlayedBig) return 38;
                      return 0;
                    },
                  },
                ],
              };

              const sortedStudents = getSortedStudentsForQuiz(h.quizId);

              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-[#3b82f6]/30 overflow-hidden hover:shadow-xl dark:hover:shadow-[#3b82f6]/20 transition-all duration-500"
                >
                  <motion.button
                    whileHover={{ backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)" }}
                    onClick={() => toggleQuiz(h.quizId)}
                    className="w-full p-8 flex justify-between items-center transition"
                  >
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {h.quizName}
                      </h3>
                      <div className="flex items-center gap-8 text-lg text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-gray-700 dark:text-[#3b82f6]" />
                          Assigned: {h.assignedAt ? new Date(h.assignedAt.seconds * 1000).toLocaleDateString() : "N/A"}
                        </span>
                        <span>{quiz.questions?.length || 0} questions</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedQuiz === h.quizId ? 180 : 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-gray-700 dark:text-[#3b82f6]"
                    >
                      <ArrowLeft className="w-8 h-8" />
                    </motion.div>
                  </motion.button>

                  {expandedQuiz === h.quizId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.5 }}
                      className="p-10 border-t border-gray-200 dark:border-[#3b82f6]/20"
                    >
                      {/* Delete Quiz Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuiz(h.quizId, h.id);
                        }}
                        disabled={deletingQuizId === h.quizId}
                        className="absolute top-6 right-6 z-20 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg disabled:opacity-50 transition flex items-center justify-center"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-6 h-6" />
                        {deletingQuizId === h.quizId && <span className="ml-2 text-sm">Deleting...</span>}
                      </button>

                      {/* Charts Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16 pt-12">
                        {/* Line Chart */}
                        <div className="lg:col-span-3">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-10 border border-gray-200 dark:border-[#3b82f6]/30 shadow-xl"
                          >
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                              Score Trend Across Modes
                            </h4>
                            <div className="h-[800px]">
                              <Line data={lineData} options={chartOptions} />
                            </div>
                          </motion.div>
                        </div>

                        {/* Bar + Doughnut */}
                        <div className="lg:col-span-2 space-y-10">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-[#3b82f6]/30 shadow-xl"
                          >
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                              Performance Analysis
                            </h4>
                            <div className="h-80">
                              <Bar data={barData} options={chartOptions} />
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-[#3b82f6]/30 shadow-xl"
                          >
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                              Participation Overview
                            </h4>
                            <div className="h-80">
                              <Doughnut
                                data={doughnutData}
                                plugins={[donutShadowPlugin]}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: "right",
                                      labels: { color: chartTextColor },
                                    },
                                    tooltip: { enabled: true },
                                  },
                                  animation: { animateRotate: true, duration: 1200 },
                                }}
                              />
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Student List with Per-Student Toggle & Expand */}
                      <div className="mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                          <h4 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
                            <Trophy className="w-10 h-10 text-yellow-500" />
                            Student Results & Access Control
                          </h4>

                          <select
                            value={sortOptions[h.quizId] || "marks"}
                            onChange={(e) => setSortOptions(prev => ({ ...prev, [h.quizId]: e.target.value }))}
                            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="marks">Sort by Average Marks (High to Low)</option>
                            <option value="name">Sort Alphabetically (A to Z)</option>
                          </select>
                        </div>

                        {sortedStudents.length === 0 ? (
                          <p className="text-center text-gray-500 dark:text-gray-400 text-xl">No student attempts yet</p>
                        ) : (
                          <div className="space-y-4">
                            {sortedStudents.map((student, i) => {
                              const isExpanded = expandedStudent[h.quizId] === student.studentId;
                              const studentResults = gameTypes.map(gt => {
                                const attempt = results[h.quizId]?.[gt]?.find(r => r.studentId === student.studentId);
                                return attempt ? { gameType: gt, score: attempt.score, total: attempt.total, percentage: attempt.percentage } : null;
                              }).filter(Boolean);

                              return (
                                <div key={student.studentId}>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md flex justify-between items-center hover:shadow-lg transition cursor-pointer"
                                    onClick={() => toggleStudentDetails(h.quizId, student.studentId)}
                                  >
                                    <div className="flex items-center gap-6 flex-1">
                                      <div className="text-xl font-bold text-gray-900 dark:text-white w-10">
                                        {i + 1}.
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                          {student.name}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                      <div className="text-right min-w-[120px]">
                                        <p className="text-xl font-bold text-blue-600 dark:text-[#60a5fa]">
                                          {student.avgPercentage}%
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Total: {student.totalScore}
                                        </p>
                                      </div>

                                      {/* Per-student toggle */}
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={studentPermissions[h.quizId]?.[student.studentId] || false}
                                          onChange={() => toggleStudentView(h.quizId, student.studentId)}
                                          className="sr-only peer"
                                        />
                                        <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5`}></div>
                                      </label>
                                    </div>
                                  </motion.div>

                                  {/* Expanded per-game scores */}
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-inner"
                                    >
                                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {student.name}'s Scores per Game
                                      </h5>
                                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        {gameTypes.map((gt) => {
                                          const res = studentResults.find(r => r.gameType === gt);
                                          return (
                                            <div key={gt} className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{gameLabels[gt]}</p>
                                              {res ? (
                                                <>
                                                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {res.score} / {res.total}
                                                  </p>
                                                  <p className="text-sm text-green-600 dark:text-green-400">
                                                    {res.percentage}%
                                                  </p>
                                                </>
                                              ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Not attempted</p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Top Performers */}
                      <div className="mb-12">
                        <h4 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 flex items-center justify-center gap-4">
                          <Trophy className="w-10 h-10 text-yellow-500" />
                          Top Performers
                        </h4>
                        {topPerformers.length === 0 ? (
                          <p className="text-center text-gray-500 dark:text-gray-400 text-xl">No attempts yet</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topPerformers.map((r, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.05, y: -10 }}
                                className={`relative overflow-hidden rounded-2xl p-6 shadow-2xl border ${
                                  i === 0
                                    ? "bg-gradient-to-br from-[#3b82f6] to-[#2563eb] border-[#60a5fa] text-white"
                                    : "bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] border-[#3b82f6]/50 text-white"
                                }`}
                              >
                                <div>
                                  <div className="text-5xl font-bold mb-2">#{i + 1}</div>
                                  <p className="text-xl font-bold mb-2">{r.studentName || "Unknown"}</p>
                                  <p className="text-lg opacity-90 mb-2">({gameLabels[r.gameType]})</p>
                                  <p className="text-2xl font-extrabold">
                                    {r.score}/{r.total} ({r.percentage}%)
                                  </p>
                                </div>
                                {i === 0 && <Trophy className="absolute top-4 right-4 w-12 h-12 text-[#fbbf24] opacity-50" />}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Game Participation */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {gameTypes.map((gt) => {
                          const played = (results[h.quizId]?.[gt] || []).length;
                          const notPlayed = totalStudents - played;
                          const percentage = totalStudents > 0 ? Math.round((played / totalStudents) * 100) : 0;

                          return (
                            <motion.div
                              key={gt}
                              whileHover={{ scale: 1.08 }}
                              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 text-center border border-gray-200 dark:border-[#3b82f6]/30 shadow-xl overflow-hidden relative"
                            >
                              <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                {gameLabels[gt]}
                              </p>

                              <div className="w-24 h-24 mx-auto mb-3">
                                <CircularProgressbar
                                  value={percentage}
                                  text={`${percentage}%`}
                                  styles={buildStyles({
                                    pathColor: sharpBlue,
                                    textColor: chartTextColor,
                                    trailColor: isDarkMode ? "#374151" : "#e5e7eb",
                                    backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6",
                                  })}
                                />
                              </div>

                              <div className="space-y-1 text-sm">
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                  {played} Played
                                </p>
                                <p className="text-red-600 dark:text-red-400 font-medium">
                                  {notPlayed} Pending
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

