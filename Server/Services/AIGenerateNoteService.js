const axios = require('axios');

/**
 * AI SERVICE - GENERATE NOTES
 * 
 * Creates study notes for a lesson using AI
 * Returns markdown formatted notes
 */

const BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'anthropic/claude-3.5-sonnet';

const generateNotes = async (lessonTitle, lessonContent, difficulty) => {
  const promptForAI = `Create comprehensive study notes for this lesson:

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

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: promptForAI }],
        temperature: 0.5,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error (notes):', error.response?.data || error.message);
    throw new Error('Failed to generate notes with AI');
  }
};

module.exports =  generateNotes;