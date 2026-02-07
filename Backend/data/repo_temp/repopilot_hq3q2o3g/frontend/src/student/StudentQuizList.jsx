import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import PlayQuiz from "./PlayQuiz";

export default function StudentQuizList({ classCode }) {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, "class_quizzes"),
        where("classCode", "==", classCode)
      );
      const snap = await getDocs(q);
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, [classCode]);

  if (activeQuiz) return <PlayQuiz quiz={activeQuiz} />;

  return quizzes.map(q => (
    <div key={q.id} className="bg-indigo-50 p-4 rounded mb-3">
      <p className="font-medium">{q.quizName}</p>
      <button
        onClick={() => setActiveQuiz(q)}
        className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded"
      >
        Attempt Quiz
      </button>
    </div>
  ));
}


