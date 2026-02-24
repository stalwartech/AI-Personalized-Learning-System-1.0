const { validationResult } = require('express-validator');
const User = require('../../models/UserModel');
const Course = require('../../models/CourseModel');
const Progress = require('../../models/ProgressModel');

const deleteAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(req.body.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    await Promise.all([
      Course.deleteMany({ userId: req.userId }),
      Progress.deleteOne({ userId: req.userId }),
      User.findByIdAndDelete(req.userId)
    ]);

    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting account', error: error.message });
  }
};

module.exports = deleteAccount;