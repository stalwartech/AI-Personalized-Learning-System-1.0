const Course = require("../Model/courseModel");

const FREE_COURSE_LIMIT = 2;

const courseMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (req.user.isPremium) {
      return next();
    }

    const courseCount = await Course.countDocuments({ userId: req.userId });

    if (courseCount >= FREE_COURSE_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `Free users can generate up to ${FREE_COURSE_LIMIT} courses. Upgrade to premium to generate more courses.`,
        limit: FREE_COURSE_LIMIT,
        coursesGenerated: courseCount,
        upgradeRequired: true
      });
    }

    return next();
  } catch (error) {
    console.error("Course limit error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking course limit",
      error: error.message
    });
  }
};

module.exports = courseMiddleware;
