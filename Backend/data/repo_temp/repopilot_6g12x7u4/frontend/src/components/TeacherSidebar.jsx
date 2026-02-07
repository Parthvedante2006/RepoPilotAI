import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { 
  Home, 
  PlusCircle, 
  Library, 
  LogOut 
} from "lucide-react";

export default function TeacherSidebar({ active, setActive }) {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("Teacher");

  useEffect(() => {
    const fetchName = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setTeacherName(data.name || "Teacher");
        }
      } catch (err) {
        console.error("Error fetching teacher name:", err);
      }
    };
    fetchName();
  }, []);

  const menuItems = [
    { id: "classes", label: "My Classes", icon: Home },
    { id: "createQuiz", label: "Create Quiz", icon: PlusCircle },
    { id: "quizList", label: "My Quizzes", icon: Library },
  ];

  const handleLogout = () => {
    auth.signOut()
      .then(() => navigate("/"))
      .catch((error) => console.error("Logout error:", error));
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header - Personalized Greeting */}
      <div className="p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <span className="text-2xl font-bold">
              {teacherName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome,</h2>
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              {teacherName}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                    active === item.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-lg font-medium transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

