/**
 * YOUTUBE API UNIT TEST
 * 
 * Run this file directly to test YouTube API independently:
 * node testYoutube.js
 */

require('dotenv').config(); // Load .env file
const axios = require('axios');

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;

const testYouTubeAPI = async () => {
  console.log('========================================');
  console.log('🧪 YOUTUBE API TEST');
  console.log('========================================\n');

  // ── Test 1: Check if API key exists ──────────────────────────────────────
  console.log('Test 1: Checking API key...');
  if (!API_KEY) {
    console.error('❌ FAILED - YOUTUBE_API_KEY is missing from .env file');
    console.log('👉 Add this to your .env file: YOUTUBE_API_KEY=your_key_here');
    process.exit(1);
  }
  console.log('✅ API key found:', API_KEY.substring(0, 8) + '...' + API_KEY.slice(-4));
  console.log();

  // ── Test 2: Make a real API call ──────────────────────────────────────────
  console.log('Test 2: Calling YouTube Search API...');
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: 'JavaScript tutorial beginner',
        key: API_KEY,
        type: 'video',
        maxResults: 1,
      }
    });

    const items = response.data.items;

    if (!items || items.length === 0) {
      console.error('❌ FAILED - API returned no results');
      process.exit(1);
    }

    const video = items[0];
    console.log('✅ Search API working!');
    console.log('   Video found:', video.snippet.title);
    console.log('   Video ID:', video.id.videoId);
    console.log('   Channel:', video.snippet.channelTitle);
    console.log();

    // ── Test 3: Get video details (duration + views) ──────────────────────
    console.log('Test 3: Calling YouTube Videos API (details)...');
    const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: video.id.videoId,
        key: API_KEY,
      }
    });

    const details = detailsResponse.data.items[0];
    console.log('✅ Details API working!');
    console.log('   Duration (raw):', details.contentDetails.duration);
    console.log('   View count (raw):', details.statistics.viewCount);
    console.log();

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('========================================');
    console.log('✅ ALL TESTS PASSED - YouTube API is working!');
    console.log('========================================');
    console.log('\nFull video object your service will return:');
    console.log({
      title: video.snippet.title,
      videoId: video.id.videoId,
      thumbnail: video.snippet.thumbnails.medium.url,
      channelTitle: video.snippet.channelTitle,
      duration: details.contentDetails.duration,
      viewCount: details.statistics.viewCount,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`
    });

  } catch (error) {
    console.error('❌ FAILED - API call error');
    console.error('\nStatus:', error.response?.status);
    console.error('Error details:', JSON.stringify(error.response?.data, null, 2));

    // Give helpful hints based on error code
    const status = error.response?.status;
    const reason = error.response?.data?.error?.errors?.[0]?.reason;

    if (status === 400) {
      console.log('\n👉 Bad request - check your API key format');
    } else if (status === 403) {
      if (reason === 'quotaExceeded') {
        console.log('\n👉 Quota exceeded - you have used all your daily API units');
        console.log('   Free tier = 10,000 units/day. Each search = 100 units.');
        console.log('   Wait until midnight Pacific Time for quota to reset.');
      } else {
        console.log('\n👉 API key is invalid or YouTube Data API v3 is not enabled');
        console.log('   Go to: console.cloud.google.com');
        console.log('   1. Select your project');
        console.log('   2. Go to APIs & Services → Library');
        console.log('   3. Search "YouTube Data API v3" and Enable it');
      }
    } else if (status === 404) {
      console.log('\n👉 Endpoint not found - check the BASE_URL');
    }
    process.exit(1);
  }
};

testYouTubeAPI();