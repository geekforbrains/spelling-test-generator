
import React from 'react';
import type { TestResult } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface ResultsPageProps {
  result: TestResult;
  testName: string;
  onRetake: () => void;
  onGoHome: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, testName, onRetake, onGoHome }) => {
  const incorrectAnswers = result.answers.filter(a => !a.isCorrect);

  const getCheerMessage = () => {
    const percentage = (result.score / result.total) * 100;
    if (percentage === 100) return "Perfect Score! Amazing job!";
    if (percentage >= 80) return "Excellent work! You're a spelling star!";
    if (percentage >= 60) return "Great effort! Keep practicing!";
    return "Good try! Every mistake is a chance to learn.";
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg space-y-6 text-center">
      <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Test Complete!</h2>
      <p className="text-lg text-slate-600 dark:text-slate-300">Results for "{testName}"</p>

      <div className="bg-blue-50 dark:bg-slate-700/50 p-6 rounded-lg">
        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">You scored</p>
        <p className="text-6xl font-bold my-2 text-slate-800 dark:text-slate-100">
          {result.score} <span className="text-4xl text-slate-500 dark:text-slate-400">/ {result.total}</span>
        </p>
        <p className="text-lg font-medium text-blue-800 dark:text-blue-300">{getCheerMessage()}</p>
      </div>

      {incorrectAnswers.length > 0 && (
        <div className="text-left">
          <h3 className="text-xl font-semibold mb-3">Words to practice:</h3>
          <ul className="space-y-2">
            {incorrectAnswers.map((answer, index) => (
              <li key={index} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-between">
                <div>
                  <p className="line-through text-red-500">{answer.answer}</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{answer.word}</p>
                </div>
                <XIcon className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onRetake}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
        >
          Retake Test
        </button>
        <button
          onClick={onGoHome}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
