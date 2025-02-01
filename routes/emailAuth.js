const User = require('../models/user');

// Email Verification Route
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Mark user as verified and remove the token
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
