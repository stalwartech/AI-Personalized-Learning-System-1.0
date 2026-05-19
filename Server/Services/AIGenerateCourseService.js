const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const AI_TIMEOUT_MS = Number(process.env.COURSE_AI_TIMEOUT_MS || 7000);
const OPENROUTER_PARALLEL_MODELS = Number(process.env.OPENROUTER_PARALLEL_MODELS || 3);

const FREE_MODELS = [
  'openai/gpt-oss-20b:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'google/gemma-3-12b-it:free',
  'google/gemma-3-27b-it:free',
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

async function generateCourseWithOpenRouterModel(prompt, model) {
  console.log(`Trying OpenRouter model: ${model}`);

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1800,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: AI_TIMEOUT_MS,
    }
  );

  console.log(`✅ Course outline generated with: ${model}`);
  return {
    content: response.data.choices[0].message.content,
    provider: `OpenRouter (${model})`,
  };
}

async function generateCourseWithOpenRouter(prompt) {
  const attempts = FREE_MODELS
    .slice(0, OPENROUTER_PARALLEL_MODELS)
    .map((model) => generateCourseWithOpenRouterModel(prompt, model));

  if (attempts.length === 0) {
    throw new Error('NO_OPENROUTER_MODELS_CONFIGURED');
  }

  return Promise.any(attempts);
}

/**
 * Generate course outline using Gemini.
 */
async function generateCourseWithGemini(prompt) {
  try {
    console.log('🟢 Generating course outline with Gemini...');

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1800,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: AI_TIMEOUT_MS,
      }
    );

    console.log('✅ Gemini course outline generated');
    return {
      content: response.data.candidates[0].content.parts[0].text,
      provider: 'Gemini',
    };

  } catch (error) {
    console.error('❌ Gemini course outline failed:', error.message);
    throw new Error('ALL_PROVIDERS_FAILED');
  }
}

/**
 * Main course generation.
 */
const generateCourse = async (query, difficulty) => {
  
  // Build the prompt for AI
  const prompt = `You are an expert course creator. Create a comprehensive course for: "${query}" at ${difficulty} level.
 
Return ONLY valid JSON format strutured like it is in the below format. Ensure that the result starts with { and ends with }, do not inlcude markdown, backiks, or explantions. The JSON should be in this exact structure below:
{
  title: "Course title",
  description: "Brief description (2-3 sentences)",
  category: "Category name",
  lessons: [
    {
      "title": "Lesson title",
      "order": 1,
      "content": "Detailed lesson content of what is expected to be learned (less than or equal to 100 characters) with examples.",
      "estimatedDuration": 15
    }
  ]
}
 
Rules:
- Create 5-8 lessons depending on topic complexity
- Progress logically from basics to advanced
- estimatedDuration is in minutes (10-30 per lesson)
- Return ONLY JSON, no extra text`;
 
  const result = await Promise.any([
    generateCourseWithOpenRouter(prompt),
    generateCourseWithGemini(prompt),
  ]);

  console.log(`📝 Course outline generated using: ${result.provider}`);
  return result.content;
};

module.exports = generateCourse;
