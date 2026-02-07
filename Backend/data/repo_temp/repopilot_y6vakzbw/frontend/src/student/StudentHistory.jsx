import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function StudentHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "quiz_results"),
      where("studentId", "==", auth.currentUser.uid)
    );

    getDocs(q).then(snap =>
      setHistory(snap.docs.map(d => d.data()))
    );
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">My Results</h3>

      {history.map((r, i) => (
        <p key={i}>
          Score: {r.score}/{r.total}
        </p>
      ))}
    </div>
  );
}


