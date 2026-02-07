export default function QuizCard({ quiz }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-3">
      <p className="font-medium">{quiz.name}</p>
      <p className="text-sm text-gray-500">
        Questions: {quiz.questions.length}
      </p>

      <button
        onClick={() => window.location.href = `/edit-quiz/${quiz.id}`}
        className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm"
      >
        View / Edit Quiz
      </button>
      <button
  onClick={() => window.location.href = `/class/${cls.id}`}
  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
>
  View History
</button>
    </div>
  );
}






