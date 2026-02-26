const axios = require('axios');
const { formatDuration, formatViewCount } = require('./youtubeFormattersService');

/**
 * YOUTUBE SERVICE - SEARCH VIDEOS
 * 
 * Searches YouTube for educational videos
 * Returns top 3 videos with details (title, thumbnail, duration, views)
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Search YouTube for videos
 * 
 * @param {string} query - Search query (e.g., "Python variables tutorial beginner")
 * @param {number} maxResults - How many videos to return (default: 3)
 * @returns {Promise<Array>} - Array of video objects
 */
const searchVideos = async (query, maxResults = 3) => {
  try {
    // ── Step 1: Search for videos ─────────────────────────────────────────────
    // This gets basic info: title, thumbnail, channel
    const searchResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',              // What data to return
        q: query,                      // Search query
        key: process.env.YOUTUBE_API_KEY,
        type: 'video',                 // Only videos (not channels or playlists)
        maxResults: maxResults,
        videoDuration: 'medium',       // 4-20 minutes (not too short/long)
        relevanceLanguage: 'en',       // English videos
        safeSearch: 'strict',          // Family-friendly content
        order: 'relevance'             // Most relevant first
      }
    });

    const videoItems = searchResponse.data.items;

    // If no videos found, return empty array
    if (!videoItems || videoItems.length === 0) {
      return [];
    }

    // ── Step 2: Get detailed info (duration, views) ───────────────────────────
    // The search endpoint doesn't include duration/views, so we need another call
    const videoIds = videoItems.map(video => video.id.videoId).join(',');

    const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const videoDetails = detailsResponse.data.items;

    // ── Step 3: Combine and format ────────────────────────────────────────────
    const formattedVideos = videoItems.map((video, index) => {
      const details = videoDetails[index];
      
      return {
        title: video.snippet.title,
        videoId: video.id.videoId,
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle,
        duration: formatDuration(details.contentDetails.duration),     // "15m 30s"
        viewCount: formatViewCount(details.statistics.viewCount),      // "2.5M views"
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`
      };
    });

    return formattedVideos;

  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      throw new Error('YouTube API quota exceeded or invalid API key');
    }
    
    throw new Error('Failed to fetch YouTube videos');
  }
};

module.exports = { searchVideos };