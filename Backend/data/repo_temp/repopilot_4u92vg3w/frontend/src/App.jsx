import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./student/StudentDashboard";
import StudentQuizzes from "./student/StudentQuizzes";
import JoinClassroom from "./student/JoinClassroom";
import StudentHistory from "./student/StudentHistory";
import StudentClassDetails from "./student/StudentClassDetails"; 
import StudentNotifications from "./student/StudentNotifications";
import StudentQuizPlay from "./student/StudentQuizPlay";

import TeacherDashboard from "./teacher/TeacherDashboard";
import ClassDetails from "./teacher/ClassDetails";
import QuizDetails from "./teacher/QuizDetails";


export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<Register />} />

          {/* GUEST & ANY PLAY QUIZ */}
          <Route path="/play/:quizId" element={<StudentQuizPlay />} />

          {/* STUDENT */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/join" element={<JoinClassroom />} />
          <Route path="/student/quizzes" element={<StudentQuizzes />} />
          <Route path="/student/history" element={<StudentHistory />} />
          <Route path="/student/play/:quizId" element={<StudentQuizPlay />} />
          <Route path="/student/class/:classId" element={<StudentClassDetails />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />

          {/* TEACHER */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/class/:classId" element={<ClassDetails />} />
         <Route path="/teacher/quiz/:quizId" element={<QuizDetails />} />

          {/* 404 */}
          <Route path="*" element={<div className="p-20 text-center text-2xl text-gray-600 dark:text-gray-300">Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}            


