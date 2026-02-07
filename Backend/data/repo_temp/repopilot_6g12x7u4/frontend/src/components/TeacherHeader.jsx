import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Bell, Check, X, Edit2, User, Mail, School, Calendar } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function TeacherHeader() {
  const [teacherData, setTeacherData] = useState(null);
  const [notifications, setNotifications] = useState([]); // Optional for teachers (e.g., student submissions)
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    school: "",
  });
  const [saving, setSaving] = useState(false);

  const user = auth.currentUser;
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchTeacherData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const fullData = {
            name: data.name || "Teacher",
            email: user.email,
            age: data.age || "Not set",
            school: data.school || "Not set",
          };
          setTeacherData(fullData);
          setEditForm({
            name: fullData.name,
            age: fullData.age === "Not set" ? "" : fullData.age,
            school: fullData.school === "Not set" ? "" : fullData.school,
          });
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      }
    };

    // Optional: Fetch teacher-specific notifications (e.g., new student joins, quiz completions)
    const fetchNotifications = async () => {
      // Implement if needed, similar to student (e.g., new class joins or results)
      // For now, leaving as empty or add logic for teacher notifications
      setNotifications([]); // Placeholder
    };

    fetchTeacherData();
    fetchNotifications();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (
      editForm.name.trim() === teacherData.name &&
      editForm.age === (teacherData.age === "Not set" ? "" : teacherData.age) &&
      editForm.school === (teacherData.school === "Not set" ? "" : teacherData.school)
    ) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: editForm.name.trim() || "Teacher",
      };
      if (editForm.age.trim()) updateData.age = editForm.age.trim();
      if (editForm.school.trim()) updateData.school = editForm.school.trim();

      await updateDoc(doc(db, "users", user.uid), updateData);

      setTeacherData(prev => ({
        ...prev,
        name: updateData.name,
        age: editForm.age.trim() || "Not set",
        school: editForm.school.trim() || "Not set",
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: teacherData?.name || "",
      age: teacherData?.age === "Not set" ? "" : teacherData?.age,
      school: teacherData?.school === "Not set" ? "" : teacherData?.school,
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
        setIsEditing(false);
        handleCancelEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [teacherData]);

  const openNotifications = () => {
    setShowNotifications(true);
  };

  return (
    <header className="fixed top-0 left-80 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 z-40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-4">
          <span className="text-3xl">🎮</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            QuizMaster
          </h1>
        </div>

        {/* RIGHT: Utilities + Profile */}
        <div className="flex items-center gap-6">
          {/* Theme & Language */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={openNotifications}
              className="relative w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 backdrop-blur-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Notifications ({notifications.length})
                </h3>

                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No notifications yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.quizId}
                        onClick={() => {
                          setShowNotifications(false);
                          // Navigate to relevant page if needed
                        }}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-all border border-gray-200 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {n.quizName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Assigned on {n.assignedAt?.toLocaleDateString() || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all ring-2 ring-offset-2 ring-indigo-500/50 dark:ring-indigo-400/50 overflow-hidden"
            >
              {teacherData?.name?.charAt(0)?.toUpperCase() || "T"}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-16 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-fadeIn">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center relative">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white/30">
                      {teacherData?.name?.charAt(0)?.toUpperCase() || "T"}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-white">
                      {teacherData?.name || "Teacher"}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      {teacherData?.email}
                    </p>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-5">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          autoFocus
                        />
                      </div>

                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          placeholder="Age"
                          value={editForm.age}
                          onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>

                      <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          placeholder="School / Institution"
                          value={editForm.school}
                          onChange={(e) => setEditForm(prev => ({ ...prev, school: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>

                      <div className="flex justify-center gap-4 mt-6">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                        >
                          <Check className="w-5 h-5" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                        >
                          <X className="w-5 h-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                            <p className="font-medium text-gray-900 dark:text-white">{teacherData?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white">{teacherData?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                            <p className="font-medium text-gray-900 dark:text-white">{teacherData?.age}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          <School className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">School</p>
                            <p className="font-medium text-gray-900 dark:text-white">{teacherData?.school}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <Edit2 className="w-5 h-5" />
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <button
                    onClick={handleSignOut}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


