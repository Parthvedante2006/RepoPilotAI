import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [createdClass, setCreatedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // NEW: track which class is being deleted
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const q = query(
          collection(db, "classes"),
          where("teacherId", "==", currentUser.uid)
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setClasses(list);
        }, (err) => {
          console.error("Firestore error:", err);
        });

        return () => unsubscribeSnapshot();
      } else {
        setClasses([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const generateCode = () =>
    "CLS-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreate = async () => {
    if (!className.trim()) {
      alert("Please enter class name");
      return;
    }

    if (!user) {
      alert("You must be logged in to create a class");
      return;
    }

    try {
      const code = generateCode();
      const joinLink = `${window.location.origin}/join/${code}`;

      const docRef = await addDoc(collection(db, "classes"), {
        name: className,
        code,
        joinLink,
        teacherId: user.uid,
        createdAt: serverTimestamp(),
      });

      setCreatedClass({ id: docRef.id, name: className, code, joinLink });
      setClassName("");
      alert("Class created successfully!");
    } catch (err) {
      alert("Error creating class: " + err.message);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(classId);
      await deleteDoc(doc(db, "classes", classId));
      alert("Class deleted successfully!");
      // No need to manually update state - onSnapshot will auto-remove it
    } catch (err) {
      alert("Error deleting class: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  if (loading) {
    return <div className="text-center py-10">Loading your classes...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-xl text-red-600">
        Please sign in to view or create classes
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Create Class Form */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 border border-gray-200 dark:border-gray-700">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Create New Class
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Enter class name (e.g. Math 101)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="flex-1 w-full px-8 py-5 border border-gray-300 dark:border-gray-600 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            onClick={handleCreate}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl font-bold rounded-2xl shadow-lg transition transform hover:scale-105"
          >
            Create Class
          </button>
        </div>

        {createdClass && (
          <div className="mt-10 p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {createdClass.name} created!
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Share this code with students:
            </p>
            <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-8">
              {createdClass.code}
            </p>
            <div className="flex justify-center gap-6">
              <button onClick={() => copy(createdClass.code)} className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                Copy Code
              </button>
              <button onClick={() => copy(createdClass.joinLink)} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
                Copy Join Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* My Classes List */}
      <div>
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          My Classes
        </h3>

        {classes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-4">
              No classes yet
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-500">
              Create your first class above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-2xl transition relative"
                onClick={() => navigate(`/class/${cls.id}`)}
              >
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{cls.name}</h4>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Class Code</p>
                  <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{cls.code}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); copy(cls.code); }}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); copy(cls.joinLink); }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
                  >
                    Copy Join Link
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/class/${cls.id}`); }}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg"
                  >
                    View Class →
                  </button>

                  {/* NEW: Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cls.id);
                    }}
                    disabled={deletingId === cls.id}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition"
                  >
                    {deletingId === cls.id ? "Deleting..." : "Delete Class"}
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

