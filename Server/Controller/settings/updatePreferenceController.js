const { validationResult } = require('express-validator');
const User = require('../../models/UserModel');

const updatePreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { learningPace, defaultDifficulty } = req.body;
    const updateData = {};

    if (learningPace) updateData['preferences.learningPace'] = learningPace;
    if (defaultDifficulty) updateData['preferences.defaultDifficulty'] = defaultDifficulty;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select('-password');
    return res.status(200).json({ success: true, message: 'Preferences updated', data: { user } });
  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ success: false, message: 'Error updating preferences', error: error.message });
  }
};

module.exports = updatePreferences;