import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import TeacherHeader from "../components/TeacherHeader";
import TeacherSidebar from "../components/TeacherSidebar";
import ClassList from "./ClassList";
import CreateQuiz from "./CreateQuiz";
import QuizList from "./QuizList";
import Chatbot from "../components/Chatbot";

export default function TeacherDashboard() {
  const [active, setActive] = useState("classes");
  const [teacherData, setTeacherData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  // Fetch teacher data (name, email, school)
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setTeacherData(userDoc.data());
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      }
    };

    fetchTeacherData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const initials = teacherData?.name
    ? teacherData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "T";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
      <TeacherHeader />

      <div className="flex">
        <TeacherSidebar active={active} setActive={setActive} />

        <main className="flex-1 ml-80 pt-24 px-12 pb-32">
          <div className="max-w-7xl mx-auto">
            {active === "classes" && <ClassList />}
            {active === "createQuiz" && <CreateQuiz />}
            {active === "quizList" && <QuizList />}
          </div>
        </main>
      </div>

      {/* Profile Button - Top Right (next to ThemeToggle in header) */}
      {/* Actually placed in TeacherHeader now — see below */}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

