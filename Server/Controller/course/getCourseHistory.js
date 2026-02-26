const Course = require('../../Model/courseModel');

/**
 * GET COURSE HISTORY CONTROLLER
 * 
 * What this does:
 * Returns all courses created by the logged-in user
 * Supports filtering by status (in-progress, completed, abandoned)
 * Supports pagination (limit & skip for large lists)
 * 
 * @route   GET /api/courses/history?status=in-progress&limit=20&skip=0
 * @access  Private
 */
const getCourseHistory = async (req, res) => {
  try {
    // ── Step 1: Get query parameters ──────────────────────────────────────────
    // req.query contains URL parameters after the ?
    // Example: /history?status=completed&limit=10&skip=0
    const { status, limit = 20, skip = 0 } = req.query;
    
    // ── Step 2: Build database filter ─────────────────────────────────────────
    const databaseFilter = { userId: req.userId };  // Only this user's courses
    
    // If status provided, add it to filter
    if (status) {
      databaseFilter.status = status;  // 'in-progress', 'completed', or 'abandoned'
    }

    // ── Step 3: Fetch courses from database ───────────────────────────────────
    // We do TWO queries in parallel using Promise.all()
    const [courses, totalCount] = await Promise.all([
      // Query 1: Get the courses
      Course.find(databaseFilter)
        .sort({ updatedAt: -1 })  // Most recent first
        .limit(parseInt(limit))   // Take only X courses
        .skip(parseInt(skip))     // Skip first X courses (for pagination)
        .select('-lessons.content -lessons.notes'),  // Don't send heavy data in list view
      
      // Query 2: Count total matching courses (for pagination info)
      Course.countDocuments(databaseFilter)
    ]);

    // ── Step 4: Send response ─────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        courses: courses,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: totalCount > (parseInt(skip) + parseInt(limit))  // Are there more pages?
        }
      }
    });

  } catch (error) {
    console.error('Get course history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching course history',
      error: error.message
    });
  }
};

module.exports = getCourseHistory;