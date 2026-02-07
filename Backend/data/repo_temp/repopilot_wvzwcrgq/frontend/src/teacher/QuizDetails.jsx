import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch quiz
      const quizSnap = await getDoc(doc(db, "quizzes", quizId));
      if (quizSnap.exists()) {
        const data = quizSnap.data();
        setQuiz({ id: quizId, ...data });
        setQuestions([...(data.questions || [])]);
      }

      // Fetch teacher's classes
      const classQuery = query(
        collection(db, "classes"),
        where("teacherId", "==", auth.currentUser.uid)
      );
      const classSnap = await getDocs(classQuery);
      setClasses(classSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Fetch assigned classes
      const assignQuery = query(
        collection(db, "class_quizzes"),
        where("quizId", "==", quizId)
      );
      const assignSnap = await getDocs(assignQuery);
      const assigned = await Promise.all(
        assignSnap.docs.map(async (d) => {
          const classSnap = await getDoc(doc(db, "classes", d.data().classId));
          return classSnap.exists() ? classSnap.data().name : "Unknown";
        })
      );
      setAssignedClasses(assigned);
    };

    fetchData();
  }, [quizId]);

  const handleSaveQuestions = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, "quizzes", quizId), { questions });
      alert("Questions saved!");
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClass) return alert("Select a class");

    try {
      setLoading(true);
      await addDoc(collection(db, "class_quizzes"), {
        quizId,
        quizName: quiz.name,
        classId: selectedClass,
        teacherId: auth.currentUser.uid,
        assignedAt: serverTimestamp(),
      });
      alert("Assigned!");
      const className = classes.find((c) => c.id === selectedClass)?.name;
      setAssignedClasses([...assignedClasses, className]);
      setSelectedClass("");
    } catch (err) {
      alert("Failed to assign");
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center">
        <p className="text-3xl text-indigo-600 dark:text-indigo-400">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base rounded-full shadow-md transition transform hover:scale-105 z-40"
        >
          ← Back
        </button>

        {/* Quiz Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-indigo-200 dark:border-indigo-800 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
            {quiz.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {questions.length} Questions
          </p>
        </div>

        {/* Assigned Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-indigo-200 dark:border-indigo-800">
          <h2 className="text-2xl font-bold text-center mb-5 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Assigned To
          </h2>
          {assignedClasses.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 text-base">
              Not assigned yet
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {assignedClasses.map((name, i) => (
                <div
                  key={i}
                  className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl text-center text-gray-800 dark:text-gray-200 font-medium text-base border border-indigo-200 dark:border-indigo-800"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign to Class */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-indigo-200 dark:border-indigo-800">
          <h2 className="text-2xl font-bold text-center mb-5 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Assign to Class
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex-1 max-w-xs px-5 py-3 border-2 border-indigo-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={loading || !selectedClass}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium text-base rounded-xl shadow-md transition transform hover:scale-105"
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>

        {/* Edit Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Edit Questions
            </h2>
            <button
              onClick={handleSaveQuestions}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-70 text-white font-medium text-base rounded-xl shadow-md transition transform hover:scale-105"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i} className="bg-indigo-50 dark:bg-indigo-950 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <input
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[i].question = e.target.value;
                    setQuestions(updated);
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-indigo-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition mb-4"
                  placeholder="Question"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {q.options.map((opt, idx) => (
                    <input
                      key={idx}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].options[idx] = e.target.value;
                        setQuestions(updated);
                      }}
                      className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-indigo-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </div>

                <input
                  value={q.answer}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[i].answer = e.target.value;
                    setQuestions(updated);
                  }}
                  className="w-full px-4 py-2.5 bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded-lg text-base font-medium text-green-700 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="Correct Answer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

