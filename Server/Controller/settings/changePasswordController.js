const { validationResult } = require('express-validator');
const User = require('../../Model/authModel');
const bcrypt = require('bcryptjs');
const env = require("dotenv").config();

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // const strength = User.checkPasswordStrength(newPassword);
    // if (!strength.isValid) {
    //   return res.status(400).json({ success: false, message: 'New password is too weak' });
    // }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
  }
};

module.exports = changePassword;