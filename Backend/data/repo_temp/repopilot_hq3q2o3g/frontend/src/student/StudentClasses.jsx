import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import StudentQuizList from "./StudentQuizList";

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, "class_students"),
        where("studentId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      setClasses(snap.docs.map(d => d.data().classCode));
    };
    fetch();
  }, []);

  if (activeClass) {
    return <StudentQuizList classCode={activeClass} />;
  }

  return classes.map((c, i) => (
    <div
      key={i}
      onClick={() => setActiveClass(c)}
      className="bg-white p-4 mb-3 rounded shadow cursor-pointer"
    >
      Classroom Code: {c}
    </div>
  ));
}


