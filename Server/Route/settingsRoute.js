const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../Middleware/authMiddleware');
const getProfile = require("../Controller/settings/getProfileController")
const updateProfile = require("../Controller/settings/updateProfileController")
const changePassword = require("../Controller/settings/changePasswordController")
const updatePreferences = require("../Controller/settings/updatePreferenceController")
const deleteAccount = require("../Controller/settings/deleteAccountController")

/**
 * SETTINGS ROUTES
 * User account management endpoints
 */

// ─── Validation Rules ─────────────────────────────────────────────────────────
const profileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
];

const passwordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  // body('confirmPassword').custom((value, { req }) => {
  //   if (value !== req.body.newPassword) {
  //     throw new Error('Passwords do not match');
  //   }
  //   return true;
  // })
];

const preferencesValidation = [
  body('learningPace').optional().isIn(['relaxed', 'moderate', 'intensive']).withMessage('Invalid learning pace'),
  body('defaultDifficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty')
];

const deleteAccountValidation = [
  body('password').notEmpty().withMessage('Password is required to delete account')
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// Get user profile
router.get('/profile', auth, getProfile); // Working perfectly

// Update profile (name, email)
router.put('/profile', auth, profileValidation, updateProfile); //

// Change password
router.put('/password', auth, passwordValidation, changePassword);

// Update learning preferences
router.put('/preferences', auth, preferencesValidation, updatePreferences);

// Delete account (requires password confirmation)
router.delete('/account', auth, deleteAccountValidation, deleteAccount);

module.exports = router;