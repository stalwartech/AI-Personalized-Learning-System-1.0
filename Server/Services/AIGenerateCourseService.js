const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'qwen/qwen3.6-plus:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'mistralai/codestral-mamba:free',
  'deepseek/deepseek-r1:free',
  'stepfun/step-3-5-flash:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
];

/** * Generate notes using OpenRouter with model fallback chain */
async function generateNotesWithOpenRouter(prompt) {
  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      console.log(`✅ Notes generated with: ${model}`);
      return {
        content: response.data.choices[0].message.content,
        provider: `OpenRouter (${model})`,
      };

    } catch (error) {
      const status = error.response?.status;
      console.warn(`⚠️ ${model} failed (${status || error.message}), trying next...`);
      // Continue to next model in the array
    }
  }

  // All models exhausted
  throw new Error('OPENROUTER_ALL_MODELS_FAILED');
}

/**
 * Generate notes using Gemini (last resort)
 */
async function generateNotesWithGemini(prompt) {
  try {
    console.log('🟢 Generating notes with Gemini...');

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2000,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );

    console.log('✅ Gemini notes generated');
    return {
      content: response.data.candidates[0].content.parts[0].text,
      provider: 'Gemini',
    };

  } catch (error) {
    console.error('❌ Gemini notes failed:', error.message);
    throw new Error('ALL_PROVIDERS_FAILED');
  }
}

/**
 * Main notes generation — tries all 15 OpenRouter models, then falls back to Gemini
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
- Create 6-10 lessons depending on topic complexity
- Progress logically from basics to advanced
- estimatedDuration is in minutes (10-30 per lesson)
- Return ONLY JSON, no extra text`;
 
  let result;

  try {
    result = await generateNotesWithOpenRouter(prompt);
  } catch (error) {
    console.log('🔄 All OpenRouter models exhausted, switching to Gemini...');
    result = await generateNotesWithGemini(prompt);
  }

  console.log(`📝 Course generated using: ${result.provider}`);
  return result.content;
};

module.exports = generateCourse;