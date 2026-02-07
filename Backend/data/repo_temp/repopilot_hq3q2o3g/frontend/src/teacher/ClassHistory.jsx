import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function ClassHistory() {
  const { classId } = useParams();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(
        collection(db, "class_quizzes"),
        where("classId", "==", classId)
      );

      const snap = await getDocs(q);
      setHistory(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    };

    fetchHistory();
  }, [classId]);

  if (!history.length)
    return <p>No quizzes assigned to this class.</p>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Class Quiz History</h3>

      {history.map((h) => (
        <div key={h.id} className="bg-white p-4 mb-3 rounded shadow">
          <p className="font-medium">{h.quizName}</p>
          <p className="text-sm text-gray-500">
            Assigned on: {new Date(h.assignedAt.seconds * 1000).toDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}



