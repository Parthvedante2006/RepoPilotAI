import { useState } from "react";
import StudentHeader from "../components/StudentHeader";
import StudentSidebar from "../components/StudentSidebar";
import JoinClassroom from "./JoinClassroom";
import StudentQuizzes from "./StudentQuizzes";
import CreateQuiz from "./CreateQuiz";
import Chatbot from "../components/Chatbot"; // ← Added Chatbot

export default function StudentDashboard() {
  const [active, setActive] = useState("join"); // Default: Join Classroom

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
      <StudentHeader />
      <div className="flex">
        <StudentSidebar active={active} setActive={setActive} />
        <main className="flex-1 ml-80 pt-24 px-12 pb-32"> {/* Added pb-32 to avoid overlap with chatbot */}
          <div className="max-w-7xl mx-auto">
            {active === "quizzes" && <StudentQuizzes />}
            {active === "join" && <JoinClassroom />}
            {active === "practice" && <CreateQuiz />}
          </div>
        </main>
      </div>

      {/* Floating EduGuide AI Chatbot */}
      <Chatbot />
    </div>
  );
}

