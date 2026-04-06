const axios = require('axios');

/**
 * AI SERVICE - GENERATE NOTES WITH AUTOMATIC FALLBACK
 * Same smart fallback system as course generation
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'anthropic/claude-3.5-sonnet';
const GEMINI_URL =  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Generate notes using OpenRouter
 */
async function generateNotesWithOpenRouter(prompt) {
  try {
    console.log('🔵 Generating notes with OpenRouter...');
    
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('✅ OpenRouter notes generated');
    return {
      content: response.data.choices[0].message.content,
      provider: 'OpenRouter'
    };

  } catch (error) {
    if (error.response?.status === 429 || error.response?.status === 402) {
      console.log('⚠️  OpenRouter limit reached for notes');
    }
    throw new Error('OPENROUTER_FAILED');
  }
}

/**
 * Generate notes using Gemini
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
          maxOutputTokens: 2000
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
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

/**
 * Main notes generation with fallback
 */
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

  let result;
  
  try {
    // Try OpenRouter first
    result = await generateNotesWithOpenRouter(prompt);
  } catch (error) {
    // Fall back to Gemini
    console.log('🔄 Switching to Gemini for notes...');
    result = await generateNotesWithGemini(prompt);
  }

  console.log(`📝 Notes generated using: ${result.provider}`);
  return result.content;
};

module.exports = generateNotes ;