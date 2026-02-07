import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function JoinClassroom() {
  const [code, setCode] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [joinedClasses, setJoinedClasses] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchJoined = async () => {
      const q = query(
        collection(db, "class_students"),
        where("studentId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const classIds = snap.docs.map((d) => d.data().classId);
      if (classIds.length === 0) return;

      const classQuery = query(
        collection(db, "classes"),
        where("__name__", "in", classIds)
      );

      const classSnap = await getDocs(classQuery);
      setJoinedClasses(
        classSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    };

    fetchJoined();
  }, [user]);

  const joinClass = async () => {
    if (!user) return setError("Please log in to join a class.");
    if (!code.trim()) return setError("Please enter a class code.");

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const classQuery = query(
        collection(db, "classes"),
        where("code", "==", code.trim().toUpperCase())
      );

      const classSnap = await getDocs(classQuery);
      if (classSnap.empty) return setError("Invalid class code.");

      const classDoc = classSnap.docs[0];

      const dupQuery = query(
        collection(db, "class_students"),
        where("studentId", "==", user.uid),
        where("classId", "==", classDoc.id)
      );

      const dupSnap = await getDocs(dupQuery);
      if (!dupSnap.empty) return setError("Already enrolled!");

      await addDoc(collection(db, "class_students"), {
        studentId: user.uid,
        classId: classDoc.id,
        joinedAt: new Date(),
      });

      setSuccess("Successfully joined!");
      setCode("");
      setTimeout(() => setSuccess(""), 4000);
      window.location.reload();
    } catch (err) {
      setError("Failed to join.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-6 relative">
      {/* Theme Toggle - Right side, but moved a little left from the edge */}
      <div className="fixed top-8 right-80 z-50">
       
      </div>


      {/* Join Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          Enter the code from your teacher
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full pl-20 pr-8 py-7 bg-gray-100 dark:bg-gray-700 rounded-3xl text-3xl font-bold text-center tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-500 transition"
              maxLength={10}
            />
          </div>

          <button
            onClick={joinClass}
            disabled={loading}
            className="px-16 py-7 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-2xl font-bold rounded-3xl shadow-xl transition transform hover:scale-105"
          >
            Join →
          </button>
        </div>

        {error && <div className="mt-8 text-center text-red-600 dark:text-red-400 text-lg">{error}</div>}
        {success && <div className="mt-8 text-center text-green-600 dark:text-green-400 text-lg">{success}</div>}
      </div>

      {/* My Classrooms */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">My Classroom</h2>

        {joinedClasses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 dark:text-gray-400">No classrooms joined yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {joinedClasses.map((cls) => (
              <div
                key={cls.id}
                onClick={() => navigate(`/student/class/${cls.id}`)}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition border border-gray-200 dark:border-gray-700"
              >
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-end p-6">
                  <span className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl text-white font-bold text-lg">
                    {cls.code}
                  </span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{cls.name}</h3>
                  <button className="w-full py-5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl text-lg font-medium transition">
                    Enter →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

