/**
 * YOUTUBE FORMATTERS
 * 
 * Helper functions to format YouTube data nicely
 */

/**
 * Convert ISO 8601 duration to readable format
 * Example: "PT15M30S" → "15m 30s"
 * 
 * @param {string} isoDuration - Duration in ISO 8601 format
 * @returns {string} - Readable duration
 */
const formatDuration = (isoDuration) => {
  // Match pattern: PT(hours)H(minutes)M(seconds)S
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds && !hours) parts.push(`${seconds}s`);  // Don't show seconds if hours present

  return parts.join(' ') || '0s';
};

/**
 * Format view count to readable format
 * Examples: 2500000 → "2.5M views", 5400 → "5.4K views"
 * 
 * @param {string|number} count - Number of views
 * @returns {string} - Formatted view count
 */
const formatViewCount = (count) => {
  const number = parseInt(count);
  
  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M views`;
  } else if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K views`;
  }
  
  return `${number} views`;
};

module.exports = { formatDuration, formatViewCount };