
import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { extractWordsFromImage } from '../services/geminiService';
import type { SpellingTest } from '../types';

interface CreateTestPageProps {
  onCreateTest: (newTest: SpellingTest) => void;
  onBack: () => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
);

const CreateTestPage: React.FC<CreateTestPageProps> = ({ onCreateTest, onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [testName, setTestName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedWords([]);
      setError(null);
    }
  };

  const handleExtractWords = useCallback(async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(imageFile);
      const words = await extractWordsFromImage(base64Image, imageFile.type);
      setExtractedWords(words);
      setTestName(`Spelling Test - ${new Date().toLocaleDateString()}`);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...extractedWords];
    newWords[index] = value;
    setExtractedWords(newWords);
  };
  
  const handleRemoveWord = (index: number) => {
    setExtractedWords(words => words.filter((_, i) => i !== index));
  };

  const handleCreateTest = () => {
    const finalWords = extractedWords.map(w => w.trim()).filter(w => w.length > 0);
    if (finalWords.length > 0 && testName.trim().length > 0) {
      const newTest: SpellingTest = {
        id: crypto.randomUUID(),
        name: testName.trim(),
        words: finalWords,
        createdAt: new Date(),
      };
      onCreateTest(newTest);
    } else {
        setError("Please add some words and a name for the test.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create New Spelling Test</h2>
        <button onClick={onBack} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Back to Home</button>
      </div>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
      
      {!imageFile && (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-slate-500 dark:text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, or WEBP</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div>
      )}

      {imagePreview && (
        <div className="space-y-4">
          <p className="font-medium">Image Preview:</p>
          <img src={imagePreview} alt="Spelling sheet preview" className="max-h-60 w-auto mx-auto rounded-md shadow-sm" />
          <button onClick={handleExtractWords} disabled={isLoading} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:focus:ring-offset-slate-800">
            {isLoading ? <Spinner /> : 'Extract Words'}
          </button>
        </div>
      )}
      
      {extractedWords.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Edit Your Spelling List</h3>
          <div className="space-y-2">
            <label htmlFor="testName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Test Name</label>
            <input
              type="text"
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {extractedWords.map((word, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => handleWordChange(index, e.target.value)}
                  className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button onClick={() => handleRemoveWord(index)} className="p-2.5 bg-red-500 text-white rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleCreateTest} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800">
            Create Test
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTestPage;
