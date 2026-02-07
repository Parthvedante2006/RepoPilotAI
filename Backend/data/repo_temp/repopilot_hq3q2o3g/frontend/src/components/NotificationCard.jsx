export default function NotificationCard({ title, message, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-indigo-50 border border-indigo-200 p-4 rounded cursor-pointer hover:bg-indigo-100"
    >
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}


