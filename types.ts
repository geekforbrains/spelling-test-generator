
export interface SpellingTest {
  id: string;
  name: string;
  words: string[];
  createdAt: Date;
}

export interface TestResult {
  testId: string;
  score: number;
  total: number;
  answers: { word: string; answer: string; isCorrect: boolean }[];
}
