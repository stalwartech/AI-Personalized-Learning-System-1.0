const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

const cleanJson = (content) => {
  return content
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
};

const normalizeQuestions = (questions, topic) => {
  if (!Array.isArray(questions)) return [];

  return questions
    .map((question, index) => {
      const options = Array.isArray(question.options)
        ? question.options.filter(Boolean).map(String)
        : [];
      const correctAnswer = String(question.correctAnswer || options[0] || '').trim();

      return {
        question: String(question.question || `${topic} question ${index + 1}`).trim(),
        options: options.length >= 2 ? options.slice(0, 4) : ['True', 'False'],
        correctAnswer,
        explanation: String(question.explanation || '').trim(),
      };
    })
    .filter((question) => question.question && question.options.includes(question.correctAnswer));
};

const fallbackQuestions = (topic, count = 10) => {
  const templates = [
    ['What is a core idea in {topic}?', 'Understanding fundamentals', 'Skipping practice', 'Avoiding examples', 'Ignoring feedback'],
    ['Which habit helps you learn {topic} faster?', 'Practice with examples', 'Only memorizing terms', 'Never reviewing', 'Avoiding mistakes'],
    ['What should you do before advanced {topic} work?', 'Build a solid foundation', 'Skip the basics', 'Ignore definitions', 'Avoid exercises'],
    ['Why are examples useful in {topic}?', 'They make abstract ideas concrete', 'They replace learning', 'They remove all practice', 'They prevent review'],
    ['What is a good way to test your {topic} knowledge?', 'Answer practice questions', 'Close all notes forever', 'Avoid recall', 'Only reread titles'],
    ['What does steady progress in {topic} require?', 'Consistent review', 'No repetition', 'Random guessing', 'Ignoring weak areas'],
    ['Which approach improves retention in {topic}?', 'Active recall', 'Passive scrolling', 'Skipping notes', 'Avoiding quizzes'],
    ['What should you do after a mistake in {topic}?', 'Review the explanation', 'Forget the topic', 'Stop practicing', 'Change topics immediately'],
    ['How can you connect ideas in {topic}?', 'Compare concepts and examples', 'Study each term once', 'Avoid summaries', 'Ignore context'],
    ['What signals readiness to move forward in {topic}?', 'You can explain key ideas', 'You saw the title', 'You guessed once', 'You skipped practice'],
  ];

  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const correctAnswer = template[1];

    return {
      question: template[0].replace('{topic}', topic),
      options: template.slice(1),
      correctAnswer,
      explanation: `${correctAnswer} is the strongest answer because it supports real understanding of ${topic}.`,
    };
  });
};

const buildPrompt = (topic, context = '') => `Create at least 10 multiple-choice quiz questions for "${topic}".

${context ? `Use this course context:\n${context}\n` : ''}
Return ONLY valid JSON. No markdown, no commentary.
Shape:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact correct option text",
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- Generate 10 to 12 questions.
- Each question must have exactly 4 options.
- correctAnswer must exactly match one option.
- Questions should test understanding, not trivia.`;

async function generateWithOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_KEY_MISSING');
  }

  for (const model of FREE_MODELS) {
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 2500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.warn(`Quiz model failed (${model}):`, error.response?.status || error.message);
    }
  }

  throw new Error('OPENROUTER_ALL_MODELS_FAILED');
}

async function generateWithGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_KEY_MISSING');
  }

  const response = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2500,
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}

const generateQuiz = async ({ topic, context = '' }) => {
  const prompt = buildPrompt(topic, context);

  try {
    let content;

    try {
      content = await generateWithOpenRouter(prompt);
    } catch {
      content = await generateWithGemini(prompt);
    }

    const parsed = JSON.parse(cleanJson(content));
    const questions = normalizeQuestions(parsed.questions, topic);

    if (questions.length >= 10) {
      return questions;
    }
  } catch (error) {
    console.warn('AI quiz generation fallback used:', error.message);
  }

  return fallbackQuestions(topic, 10);
};

module.exports = generateQuiz;
