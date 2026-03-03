const { validationResult } = require('express-validator');
const User = require('../../Model/authModel');

/**
 * UPDATE PROFILE CONTROLLER
 *
 * Allows a logged-in user to update their name and/or email.
 * 
 * What happens:
 * 1. Validate the request body
 * 2. Only update fields that were actually provided
 * 3. If email is being changed, check no other user owns it
 * 4. Save changes and return updated user (without password)
 *
 * @route   PUT /api/users/profile
 * @access  Private (requires auth token)
 */
const updateProfile = async (req, res) => {
  try {
    // ── Step 1: Validate request body ─────────────────────────────────────────
    // Checks rules defined in the route (e.g. valid email format, name not empty)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // ── Step 2: Extract fields from request body ──────────────────────────────
    // User can update name, email, or both at the same time
    const { fullName, email } = req.body;

    // Build update object dynamically
    // Only include fields the user actually sent — prevents overwriting
    // existing data with undefined values
    const updateData = {};

    // ── Step 3: Add name to update if provided ────────────────────────────────
    if (fullName) updateData.fullName = fullName;

    // ── Step 4: Validate and add email to update if provided ──────────────────
    if (email) {
      // Check if another user already owns this email
      // $ne (not equal) excludes the current user from the search
      // so they can keep their own email without triggering this error
      const existingUser = await User.findOne({email,_id: { $ne: req.userId }});

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updateData.email = email;
    }

    // ── Step 5: Update user in database ───────────────────────────────────────
    // findByIdAndUpdate options:
    //   new: true          → return the updated document, not the old one
    //   runValidators: true → enforce schema rules on the new values
    // .select('-password')  → remove password field from returned data
    //                         so it is never sent to the frontend
    const user = await User.findByIdAndUpdate(
      req.userId,   // WHO to update (set by auth middleware from JWT token)
      updateData,   // WHAT to update (only fields the user provided)
      { new: true, runValidators: true }
    ).select('-password');

    // ── Step 6: Return updated user ───────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { user }  // Updated user object (password excluded)
    });

  } catch (error) {
    // ── Handle unexpected errors ──────────────────────────────────────────────
    // e.g. database connection issues, invalid ObjectId, schema validation errors
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

module.exports = updateProfile;
