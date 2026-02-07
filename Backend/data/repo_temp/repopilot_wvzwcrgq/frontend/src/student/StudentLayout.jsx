import StudentSidebar from "../components/student/StudentSidebar";

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <StudentSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}


