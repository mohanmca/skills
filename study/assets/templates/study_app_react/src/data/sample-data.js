export const STORE_KEY = '{{TOPIC_KEY}}' || 'study-app-default';

export const MODULE_NAMES = [
  'Module 1: Foundations',
  'Module 2: Core Concepts',
];

export const SLIDES = [
  {
    module: 0,
    type: 'intro',
    title: 'Welcome',
    content: ['This is a starter study deck. Replace this content with your generated slides.'],
  },
  {
    module: 0,
    type: 'concept',
    title: 'Sample Concept',
    content: ['Study content goes here.', 'Here is a sample formula:'],
    formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  },
  {
    module: 0,
    type: 'quiz',
    title: 'Module 1 Quiz',
    questions: [
      {
        id: 'm1-q1',
        type: 'mcq',
        difficulty: 'easy',
        concept: 'Sample',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: '2 + 2 equals 4.',
      },
    ],
  },
];

export const FINAL_EXAM = {
  examId: 'final-exam',
  title: 'Final Exam',
  questions: [
    {
      id: 'final-q1',
      sourceModule: 'module-001',
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital of France.',
      difficulty: 'easy',
    },
  ],
};
