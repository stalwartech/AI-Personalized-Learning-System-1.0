const User = require('../../Model/authModel');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

module.exports = getProfile;