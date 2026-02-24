const axios = require('axios');

/**
 * AI SERVICE - GENERATE COURSE
 * 
 * This talks to OpenRouter API to generate course content using AI
 * OpenRouter gives us access to Claude, GPT, and other AI models
 */

const BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'anthropic/claude-3.5-sonnet';

const generateCourse = async (query, difficulty) => {
  const promptForAI = `You are an expert course creator. Create a comprehensive course for: "${query}" at ${difficulty} level.

Return ONLY valid JSON in this exact structure:
{
  "title": "Course title",
  "description": "Brief description (2-3 sentences)",
  "category": "Category name",
  "lessons": [
    {
      "title": "Lesson title",
      "order": 1,
      "content": "Detailed lesson content (200-300 words) with examples.",
      "estimatedDuration": 15
    }
  ]
}

Rules:
- Create 6-10 lessons depending on topic complexity
- Progress logically from basics to advanced
- estimatedDuration is in minutes (10-30 per lesson)
- Return ONLY JSON, no extra text`;

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: promptForAI }],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'AI Learning Platform'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();

    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      throw new Error('AI returned invalid course structure');
    }
  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate course with AI');
  }
};

module.exports = { generateCourse };