import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function CreateQuiz() {
  const [pdf, setPdf] = useState(null);
  const [extraText, setExtraText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const [questions, setQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [quizName, setQuizName] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchClasses();
  }, []);

  const generateQuiz = async () => {
    if (!pdf && !extraText.trim()) {
      alert("Please upload a PDF or enter some text");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      if (pdf) formData.append("file", pdf);
      formData.append("difficulty", difficulty);
      if (extraText.trim()) formData.append("extraText", extraText.trim());

      const res = await fetch("http://127.0.0.1:5001/upload-pdf-generate-games", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");

      setQuestions(data.games.mcq.slice(0, 20));
      setGenerated(true);
    } catch (e) {
      alert(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const assignQuiz = async () => {
    if (!quizName.trim()) return alert("Please enter a quiz name");
    if (!selectedClass) return alert("Please select a class");

    try {
      setLoading(true);

      const quizRef = await addDoc(collection(db, "quizzes"), {
        name: quizName.trim(),
        message: message.trim(),
        teacherId: auth.currentUser.uid,
        questions,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "class_quizzes"), {
        quizId: quizRef.id,
        quizName: quizName.trim(),
        classId: selectedClass,
        teacherId: auth.currentUser.uid,
        assignedAt: serverTimestamp(),
      });

      alert("Quiz created and assigned successfully! 🎉");

      // Reset form
      setPdf(null);
      setExtraText("");
      setQuestions([]);
      setQuizName("");
      setMessage("");
      setSelectedClass("");
      setGenerated(false);
    } catch (e) {
      alert("Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Create New Quiz
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 border border-gray-200 dark:border-gray-700">
          {/* Upload & Generation Section */}
          <div className="space-y-8">
            {/* PDF Upload */}
            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-3">
                Upload Study Material (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdf(e.target.files[0] || null)}
                className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              {pdf && (
                <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                  ✓ {pdf.name}
                </p>
              )}
            </div>

            {/* Extra Text */}
            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-3">
                Additional Instructions or Text (Optional)
              </label>
              <textarea
                rows="4"
                placeholder="Paste key points, topics, or specific instructions..."
                value={extraText}
                onChange={(e) => setExtraText(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-3">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full md:w-64 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generateQuiz}
                disabled={loading}
                className="px-16 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white text-xl font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              >
                {loading ? "Generating..." : "Generate Quiz"}
              </button>
            </div>
          </div>

          {/* Questions Editing & Assignment */}
          {generated && questions.length > 0 && (
            <div className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Edit Questions & Assign
              </h2>

              {/* Questions List - Compact */}
              <div className="space-y-6 mb-10">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                  >
                    <input
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].question = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full px-5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Question"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {q.options.map((opt, idx) => (
                        <input
                          key={idx}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[i].options[idx] = e.target.value;
                            setQuestions(updated);
                          }}
                          className="px-5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-5 py-3 bg-green-50 dark:bg-green-900/30 border border-green-500 dark:border-green-700 rounded-lg text-base font-bold text-green-700 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Correct Answer"
                    />
                  </div>
                ))}
              </div>

              {/* Assignment Section */}
              <div className="space-y-6">
                <input
                  placeholder="Quiz Title (required)"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  rows="3"
                  placeholder="Message for students (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class to Assign</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                <div className="text-center">
                  <button
                    onClick={assignQuiz}
                    disabled={loading || !quizName || !selectedClass}
                    className="px-20 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-70 text-white text-xl font-bold rounded-xl shadow-lg transition transform hover:scale-105"
                  >
                    {loading ? "Saving..." : "Save & Assign Quiz"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

