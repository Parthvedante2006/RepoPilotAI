import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Confetti from "react-confetti";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE"
);

export default function DailyPracticeGame({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = showAnswer && selected === question.answer;

  const handleSelect = (option) => {
    if (showAnswer) return;
    setSelected(option);
  };

  const generateExplanation = async () => {
    setLoadingExplanation(true);
    setExplanation("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are an expert, friendly teacher. Explain this MCQ clearly and encouragingly:

Question: ${question.question}

Options:
${question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}

Correct answer: ${question.answer}

Student selected: ${selected}

Provide:
- Why the correct answer is right (1-2 sentences)
- Why the student's choice was wrong (if wrong, 1 sentence)
- One simple key tip/concept to remember

Keep under 100 words. Use simple language. End with encouragement.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      setExplanation(response.trim());
    } catch (err) {
      console.error("Gemini error:", err);
      setExplanation(
        "Sorry, couldn't generate explanation right now. " +
          (isCorrect
            ? "Great job — this is correct!"
            : `The correct answer is: ${question.answer}`)
      );
    } finally {
      setLoadingExplanation(false);
    }
  };

  const checkAnswer = () => {
    if (!selected) return;
    setShowAnswer(true);

    const correct = selected === question.answer;
    if (correct) {
      setCorrectCount((c) => c + 1);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3000);
    }

    generateExplanation();
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      onFinish(correctCount + (isCorrect ? 1 : 0));
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowAnswer(false);
      setExplanation("");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-4 sm:p-6 overflow-hidden transition-colors duration-500">
      {confettiActive && <Confetti numberOfPieces={250} gravity={0.2} />}

      <div className="w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 border border-indigo-200 dark:border-indigo-800 min-h-[85vh] sm:min-h-[90vh] flex flex-col transition-colors">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-base sm:text-lg font-medium mb-3 text-gray-900 dark:text-white">
            <span>
              Question {currentIndex + 1}/{questions.length}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              Correct: {correctCount}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-center leading-tight flex-grow flex items-center justify-center text-gray-900 dark:text-white">
          {question.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 flex-grow">
          {question.options.map((option, i) => {
            const base =
              "p-6 rounded-2xl text-lg sm:text-xl font-medium transition-all border-2 shadow-md hover:scale-105 flex items-center justify-center min-h-[110px] text-center";

            let style =
              "bg-white border-gray-300 text-gray-900 hover:bg-indigo-50 " +
              "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-indigo-950";

            if (showAnswer && option === question.answer) {
              style =
                "bg-green-100 border-green-500 text-green-800 " +
                "dark:bg-green-900/40 dark:border-green-500 dark:text-green-200";
            } else if (showAnswer && selected === option && option !== question.answer) {
              style =
                "bg-red-100 border-red-500 text-red-800 " +
                "dark:bg-red-900/40 dark:border-red-500 dark:text-red-200";
            } else if (selected === option) {
              style =
                "bg-indigo-100 border-indigo-500 text-indigo-800 " +
                "dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-200";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={showAnswer}
                className={`${base} ${style}`}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-auto">
          {!showAnswer && selected && (
            <button
              onClick={checkAnswer}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 text-white font-bold text-xl rounded-xl shadow-lg transition hover:scale-105"
            >
              Check Answer
            </button>
          )}

          {showAnswer && (
            <button
              onClick={nextQuestion}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 text-white font-bold text-xl rounded-xl shadow-lg transition hover:scale-105"
            >
              {currentIndex + 1 === questions.length ? "Finish" : "Next →"}
            </button>
          )}
        </div>

        {/* AI Explanation */}
        {showAnswer && (
          <div className="mt-10 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">
              {isCorrect ? "Great Job! 🎉" : "Let's Learn!"}
            </h3>

            {loadingExplanation ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                <span className="ml-4 text-indigo-600 dark:text-indigo-400">
                  Generating smart explanation...
                </span>
              </div>
            ) : (
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {explanation || "Loading explanation..."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


