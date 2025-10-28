
import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import CreateTestPage from './components/CreateTestPage';
import TestPage from './components/TestPage';
import ResultsPage from './components/ResultsPage';
import type { SpellingTest, TestResult } from './types';

type View = 'home' | 'create' | 'test' | 'results';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [tests, setTests] = useState<SpellingTest[]>([]);
  const [activeTest, setActiveTest] = useState<SpellingTest | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleCreateTest = useCallback((newTest: SpellingTest) => {
    setTests(prevTests => [...prevTests, newTest]);
    setView('home');
  }, []);

  const handleStartTest = useCallback((test: SpellingTest) => {
    setActiveTest(test);
    setView('test');
  }, []);

  const handleTestComplete = useCallback((result: TestResult) => {
    setTestResult(result);
    setView('results');
  }, []);

  const handleGoHome = useCallback(() => {
    setActiveTest(null);
    setTestResult(null);
    setView('home');
  }, []);
  
  const handleRetakeTest = useCallback(() => {
    if (testResult) {
      const testToRetake = tests.find(t => t.id === testResult.testId);
      if (testToRetake) {
        setActiveTest(testToRetake);
        setTestResult(null);
        setView('test');
      }
    }
  }, [testResult, tests]);

  const renderView = () => {
    switch (view) {
      case 'create':
        return <CreateTestPage onCreateTest={handleCreateTest} onBack={handleGoHome} />;
      case 'test':
        if (activeTest) {
          return <TestPage test={activeTest} onTestComplete={handleTestComplete} onExit={handleGoHome} />;
        }
        // Fallback to home if no active test
        setView('home');
        return null;
      case 'results':
        if (testResult) {
          const testName = tests.find(t => t.id === testResult.testId)?.name || 'Spelling Test';
          return <ResultsPage result={testResult} testName={testName} onRetake={handleRetakeTest} onGoHome={handleGoHome} />;
        }
         // Fallback to home if no results
        setView('home');
        return null;
      case 'home':
      default:
        return <HomePage tests={tests} onStartTest={handleStartTest} onCreateNew={() => setView('create')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 font-sans">
      <header className="bg-white dark:bg-slate-800/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
            Spelling Test AI
          </h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-1">
            Turn spelling sheets into interactive tests!
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
