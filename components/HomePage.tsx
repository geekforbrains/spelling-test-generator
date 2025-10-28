
import React from 'react';
import type { SpellingTest } from '../types';

interface HomePageProps {
  tests: SpellingTest[];
  onStartTest: (test: SpellingTest) => void;
  onCreateNew: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ tests, onStartTest, onCreateNew }) => {
  return (
    <div className="space-y-8">
      <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome!</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Create a new spelling test from a photo or retake one of your previous tests.
        </p>
        <button
          onClick={onCreateNew}
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
        >
          Create New Test
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">My Tests</h3>
        {tests.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
            You haven't created any tests yet.
          </p>
        ) : (
          <div className="space-y-4">
            {tests.map(test => (
              <div key={test.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{test.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{test.words.length} words &bull; Created on {test.createdAt.toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => onStartTest(test)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
                >
                  Start Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
