import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function CreateClass() {
  const [className, setClassName] = useState("");
  const [createdClass, setCreatedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCode = () =>
    "CLS-" + Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleCreate = async () => {
    if (!className.trim()) return alert("Enter class name");

    try {
      setLoading(true);
      const code = generateCode();
      const joinLink = `${window.location.origin}/join/${code}`;

      const docRef = await addDoc(collection(db, "classes"), {
        name: className,
        code,
        joinLink,
        teacherId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setCreatedClass({
        id: docRef.id,
        name: className,
        code,
        joinLink,
      });

      setClassName("");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Create Classroom</h3>

      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="Class Name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-indigo-600 text-white p-2 rounded"
      >
        {loading ? "Creating..." : "Create Class"}
      </button>

      {createdClass && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <p className="font-medium">{createdClass.name}</p>
          <p className="text-sm mt-2">Code: {createdClass.code}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => copy(createdClass.code)}
              className="text-sm bg-gray-200 px-3 py-1 rounded"
            >
              Copy Code
            </button>

            <button
              onClick={() => copy(createdClass.joinLink)}
              className="text-sm bg-gray-200 px-3 py-1 rounded"
            >
              Copy Join Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

