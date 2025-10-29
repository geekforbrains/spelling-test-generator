
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateSentenceForWord, textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import type { SpellingTest, TestResult } from '../types';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface TestPageProps {
  test: SpellingTest;
  onTestComplete: (result: TestResult) => void;
  onExit: () => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
);

const TestPage: React.FC<TestPageProps> = ({ test, onTestComplete, onExit }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [sentence, setSentence] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const resultsRef = useRef<{ word: string; answer: string; isCorrect: boolean }[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMountedRef = useRef(true);

  const currentWord = test.words[currentWordIndex];

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!isMountedRef.current) return;
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;
    
    try {
        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);
        
        if (!isMountedRef.current) return;
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        // Track this source so we can stop it if needed
        activeSourcesRef.current.push(source);
        
        return new Promise<void>((resolve) => {
            source.onended = () => {
                // Remove from active sources when finished
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                resolve();
            };
            source.start();
        });
    } catch (error) {
        console.error("Failed to play audio:", error);
    }
  }, []);

  const speakWordAndSentence = useCallback(async (word: string, sentenceToSpeak: string) => {
      if (!isMountedRef.current) return;
      
      setIsSpeaking(true);
      try {
          const wordAudio = await textToSpeech(word);
          if (!isMountedRef.current) return;
          await playAudio(wordAudio);
          
          if (!isMountedRef.current) return;
          await new Promise(resolve => setTimeout(resolve, 300)); // Small pause
          
          if (!isMountedRef.current) return;
          const sentenceAudio = await textToSpeech(sentenceToSpeak);
          if (!isMountedRef.current) return;
          await playAudio(sentenceAudio);
      } catch (error) {
          console.error("Error in speech synthesis process:", error);
      } finally {
          if (isMountedRef.current) {
              setIsSpeaking(false);
          }
      }
  }, [playAudio]);

  useEffect(() => {
    setIsLoading(true);
    setFeedback('unanswered');
    setUserAnswer('');
    generateSentenceForWord(currentWord)
      .then(async (generatedSentence) => {
        setSentence(generatedSentence);
        setIsLoading(false);
        await speakWordAndSentence(currentWord, generatedSentence);
      })
      .catch(err => {
        console.error(err);
        setSentence(`The word is "${currentWord}".`);
        setIsLoading(false);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex, test.words]);

  // Cleanup effect: stop all audio when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Stop all active audio sources
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (error) {
          // Source may already be stopped, ignore error
        }
      });
      activeSourcesRef.current = [];
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== 'unanswered') return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentWord.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    resultsRef.current.push({ word: currentWord, answer: userAnswer, isCorrect });
  };

  const handleNext = () => {
    if (currentWordIndex < test.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      const score = resultsRef.current.filter(r => r.isCorrect).length;
      onTestComplete({
        testId: test.id,
        score,
        total: test.words.length,
        answers: resultsRef.current,
      });
    }
  };
  
  const feedbackStyles = {
    correct: 'bg-green-100 dark:bg-green-900/50 border-green-500',
    incorrect: 'bg-red-100 dark:bg-red-900/50 border-red-500',
    unanswered: 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
  };

  return (
    <div className={`p-6 sm:p-8 rounded-lg shadow-lg border-2 ${feedbackStyles[feedback]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12"></div> {/* Spacer for centering title */}
        <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{test.name}</p>
            <h2 className="text-2xl font-bold">Word {currentWordIndex + 1} of {test.words.length}</h2>
        </div>
        <button onClick={onExit} className="w-12 text-right text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Exit
        </button>
      </div>

      <div className="text-center min-h-[120px] flex flex-col justify-center items-center bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <button onClick={() => speakWordAndSentence(currentWord, sentence)} disabled={isSpeaking || feedback !== 'unanswered'} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
              <SpeakerIcon className="w-8 h-8"/>
              <span className="text-xl font-semibold">{isSpeaking ? 'Speaking...' : 'Listen'}</span>
            </button>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{sentence}</p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type the word here..."
          disabled={feedback !== 'unanswered' || isLoading}
          className="w-full text-center text-lg p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 disabled:bg-slate-200 dark:disabled:bg-slate-600"
        />
        {feedback === 'unanswered' && (
          <button type="submit" disabled={isLoading || isSpeaking} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-500">
            Check Answer
          </button>
        )}
      </form>
      
      {feedback !== 'unanswered' && (
        <div className="mt-6 text-center space-y-4">
            {feedback === 'correct' ? (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckIcon className="w-8 h-8" />
                    <p className="text-xl font-bold">Correct!</p>
                </div>
            ) : (
                <div className="text-red-600 dark:text-red-400">
                    <div className="flex items-center justify-center gap-2">
                        <XIcon className="w-8 h-8" />
                        <p className="text-xl font-bold">Not quite...</p>
                    </div>
                    <p className="mt-2 text-lg">The correct spelling is: <strong className="underline">{currentWord}</strong></p>
                </div>
            )}
            <button onClick={handleNext} className="w-full text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-800">
                {currentWordIndex < test.words.length - 1 ? 'Next Word' : 'Finish Test'}
            </button>
        </div>
      )}

    </div>
  );
};

export default TestPage;
