const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../../Model/authModel');
const Course = require('../../Model/courseModel');
const Progress = require('../../Model/progressModel');

const deleteAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
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
