import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const q = query(
        collection(db, "quizzes"),
        where("teacherId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuizzes(list);
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      const assignments = {};
      for (const quiz of quizzes) {
        const assignQuery = query(
          collection(db, "class_quizzes"),
          where("quizId", "==", quiz.id)
        );
        const assignSnap = await getDocs(assignQuery);
        const assigned = await Promise.all(
          assignSnap.docs.map(async (d) => {
            const classSnap = await getDoc(doc(db, "classes", d.data().classId));
            return classSnap.exists() ? classSnap.data().name : "Unknown";
          })
        );
        assignments[quiz.id] = assigned;
      }
      setAssignedClasses(assignments);
    };
    if (quizzes.length > 0) fetchAssignments();
  }, [quizzes]);

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-8">
        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border border-indigo-200 dark:border-indigo-800 max-w-lg mx-auto">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            No Quizzes Yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create your first quiz and start teaching! ✏️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-10">
          My Quizzes
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <div
              key={q.id}
              onClick={() => navigate(`/teacher/quiz/${q.id}`)}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-200 dark:border-indigo-800 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-indigo-400 dark:hover:border-indigo-500"
            >
              {/* Compact Blue Gradient Banner */}
              <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div>
                <span className="text-6xl font-bold text-white/90 drop-shadow-lg group-hover:scale-110 transition-transform">
                  {q.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Compact Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                  {q.name}
                </h3>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    {q.questions?.length || 0} Qs
                  </span>
                  {assignedClasses[q.id]?.length > 0 && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {assignedClasses[q.id].length} class{assignedClasses[q.id].length > 1 ? "es" : ""}
                    </span>
                  )}
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium text-base rounded-xl transition transform group-hover:scale-105">
                  View & Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






