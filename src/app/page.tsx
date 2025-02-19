"use client";

import { useState, useEffect } from "react";
import questionsData from "./questions.json";

type Question = {
  question: string;
  options: string[];
  correct: string;
};

type Category = {
  name: string;
  questions: Question[];
};

type QuestionsData = {
  categories: Category[];
};

const TicTacToeQuiz: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [categories, setCategories] = useState<Category[]>([]);
  const [cellCategories, setCellCategories] = useState<string[]>(
    Array(9).fill("")
  );
  const [currentPlayer, setCurrentPlayer] = useState<"O" | "X">("O");
  const [selectedQuestion, setSelectedQuestion] = useState<
    (Question & { category: string }) | null
  >(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [scores, setScores] = useState<{ O: number; X: number }>({
    O: 0,
    X: 0,
  });
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [isCheckAnswer, setIsCheckAnswer] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("darkMode");
      setDarkMode(storedDarkMode === "true");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    const data = questionsData as QuestionsData;
    setCategories(data.categories);
    const randomCategories = Array(9)
      .fill(null)
      .map(() => {
        const randomCategory =
          data.categories[Math.floor(Math.random() * data.categories.length)];
        return randomCategory.name;
      });
    setCellCategories(randomCategories);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && selectedQuestion) {
      setFeedback("⏰ Time's up! Passing to the next team.");
      setTimeout(() => resetTurn(), 1000);
      setIsCheckAnswer(false);
      setIsAnswering(false);
    }
  }, [timeLeft, selectedQuestion]);

  const checkWinner = (board: (string | null)[]) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const resetTurn = () => {
    setFeedback(null);
    setSelectedQuestion(null);
    setSelectedIndex(null);
    setCurrentPlayer(currentPlayer === "O" ? "X" : "O");
  };

  const handleCellClick = (index: number) => {
    if (board[index] || isAnswering) return;
    const categoryName = cellCategories[index];
    const category = categories.find((cat) => cat.name === categoryName);
    if (!category) return;

    const availableQuestions = category.questions;
    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setSelectedQuestion({ ...randomQuestion, category: categoryName });
    setSelectedIndex(index);
    setTimeLeft(60);
    setIsAnswering(true);
  };

  const handleAnswer = (answer: string) => {
    if (!selectedQuestion || selectedIndex === null) return;

    setIsCheckAnswer(true);

    if (answer === selectedQuestion.correct) {
      const newBoard = [...board];
      newBoard[selectedIndex] = currentPlayer;
      setBoard(newBoard);
      setFeedback("✅ Correct!");

      const winner = checkWinner(newBoard);
      if (winner) {
        handleWin(winner as "O" | "X");
      }
    } else {
      setFeedback("❌ Wrong!");
    }

    setTimeout(() => {
      setIsCheckAnswer(false);
      setIsAnswering(false);
      resetTurn();
    }, 1000);
  };

  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  const handleWin = (winner: "O" | "X") => {
    setScores((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));

    if (scores[winner] + 1 === 2) {
      setWinnerMessage(
        `🏆 Team ${winner === "O" ? "A" : "B"} is the champion!`
      );
      setScores({ O: 0, X: 0 });
      setBoard(Array(9).fill(null));
      resetTurn();
    } else {
      setWinnerMessage(
        `🎉 Team ${winner === "O" ? "A" : "B"} wins this round!`
      );
      setBoard(Array(9).fill(null));
      resetTurn();
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-5 min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <button
        onClick={() => toggleDarkMode()}
        className="absolute top-5 right-5 p-2 bg-gray-700 text-white rounded-lg"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <h1 className="text-3xl font-bold">Tic Tac Toe Quiz</h1>
      <div className="flex justify-between w-64 text-lg font-bold mt-3">
        <span className="text-blue-500">Team A (O): {scores.O}</span>
        <span className="text-red-500">Team B (X): {scores.X}</span>
      </div>
      <div className="border justify-center text-lg font-bold rounded-lg mt-5">
        <h2
          className={`p-2 px-10 font-bold ${
            currentPlayer === "O" ? "text-blue-500" : "text-red-500"
          }`}
        >
          Current Turn: {currentPlayer === "O" ? "Team A (O)" : "Team B (X)"}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-5">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`w-24 h-24 border flex items-center justify-center text-lg font-bold rounded-lg transition-all duration-300 ${
              darkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-300 bg-white"
            } ${selectedIndex === index ? "bg-green-500 text-white" : ""}`}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || isAnswering}
          >
            <span>{cell || cellCategories[index]}</span>
          </button>
        ))}
      </div>
      {selectedQuestion && (
        <div
          className={`mt-5 p-5 border rounded-lg shadow-md w-96 animate-fade-in transition-all duration-300 
    ${
      darkMode
        ? "border-gray-600 bg-gray-800 text-white"
        : "border-gray-300 bg-white text-gray-800"
    }`}
        >
          <h2 className="text-xl font-bold">{selectedQuestion.category}</h2>
          <p className="whitespace-pre-wrap mt-2">
            {selectedQuestion.question}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {selectedQuestion.options.map((option) => (
              <button
                key={option}
                className="p-2 rounded-lg transition-all duration-300
            bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => handleAnswer(option)}
                disabled={isCheckAnswer}
              >
                {option}
              </button>
            ))}
          </div>
          <div
            className={`mt-3 text-lg font-bold ${
              darkMode ? "text-red-400" : "text-red-700"
            }`}
          >
            Time left: {timeLeft} seconds
          </div>
        </div>
      )}

      {winnerMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-black">{winnerMessage}</h2>
            <button
              onClick={() => setWinnerMessage(null)}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              OK, Next Round!
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="mt-3 text-lg font-bold animate-bounce">{feedback}</div>
      )}

      <footer className="mt-5 text-center text-gray-500 text-sm">
        -- # Outing Order & MM Haha Hihi # --
      </footer>
    </div>
  );
};

export default TicTacToeQuiz;
