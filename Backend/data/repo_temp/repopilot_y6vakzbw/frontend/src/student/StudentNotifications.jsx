import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function StudentNotifications() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "class_quizzes"),
      where("studentIds", "array-contains", auth.currentUser.uid)
    );

    getDocs(q).then(snap =>
      setNotes(snap.docs.map(d => d.data()))
    );
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Notifications</h3>

      {notes.map((n, i) => (
        <div key={i} className="border p-2 mb-2">
          New Quiz: {n.quizName}
        </div>
      ))}
    </div>
  );
}


