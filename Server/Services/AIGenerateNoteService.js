const axios = require('axios');
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const AI_TIMEOUT_MS = Number(process.env.NOTES_AI_TIMEOUT_MS || 7000);
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

//Generate notes using OpenRouter with model fallback chain

async function generateNotesWithOpenRouterModel(prompt, model) {
  console.log(`🔵 Trying OpenRouter model: ${model}`);

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1400,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: AI_TIMEOUT_MS,
    }
  );

  console.log(`✅ Notes generated with: ${model}`);
  return {
    content: response.data.choices[0].message.content,
    provider: `OpenRouter (${model})`,
  };
}

async function generateNotesWithOpenRouter(prompt) {
  const attempts = FREE_MODELS
    .slice(0, OPENROUTER_PARALLEL_MODELS)
    .map((model) => generateNotesWithOpenRouterModel(prompt, model));

  if (attempts.length === 0) {
    throw new Error('NO_OPENROUTER_MODELS_CONFIGURED');
  }

  return Promise.any(attempts);
}

// Generate notes using Gemini

async function generateNotesWithGemini(prompt) {
  try {
    console.log('🟢 Generating notes with Gemini...');
    
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1400
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: AI_TIMEOUT_MS
      }
    );

    console.log('✅ Gemini notes generated');
    return {
      content: response.data.candidates[0].content.parts[0].text,
      provider: 'Gemini'
    };

  } catch (error) {
      console.error('❌ Gemini notes failed:', error.message);
      throw new Error('Both providers failed for notes generation');
  }
}

// Main notes generation with fallback
const generateNotes = async (lessonTitle, lessonContent, difficulty) => {
  const prompt = `Create comprehensive study notes for this lesson:

**Lesson Title:** ${lessonTitle}
**Difficulty:** ${difficulty}

**Lesson Content:**
${lessonContent}

Generate notes in markdown format with these sections:

# ${lessonTitle} - Study Notes

## Key Concepts
[List 3-5 main concepts]

## Summary
[2-3 paragraph summary]

## Important Points
[Bullet points of crucial information]

## Examples
[1-2 practical examples with explanations]

## Quick Review
[3-5 review questions]

## Further Reading
[Topics to explore next]`;

  const result = await Promise.any([
    generateNotesWithOpenRouter(prompt),
    generateNotesWithGemini(prompt),
  ]);

  console.log(`📝 Notes generated using: ${result.provider}`);
  return result.content;
};

module.exports = generateNotes ;
