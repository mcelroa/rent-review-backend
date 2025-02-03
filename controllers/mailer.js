// mailer.js
const axios = require('axios');
const User = require('../models/user');


exports.sendVerificationEmail = async (toEmail, subject, textContent) => {
  const apiKey = process.env.BREVO_API_KEY;  // Make sure to keep your API key in .env

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',  // Brevo email API endpoint
      {
        sender: { email: 'rentreview.verify@gmail.com' },
        to: [{ email: toEmail }],
        subject: subject,
        textContent: textContent,
      },
      {
        headers: {
          'Api-Key': apiKey,  // Use your Sendinblue API key
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Email verification route
exports.verifyEmail = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    console.log("User fetched from DB:", user); // Log user before anything else

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Before checking if verified:", user.isVerified); // Check value before if statement

    // Check if the user is already verified
    if (user.isVerified) {
      console.log("User already verified, returning response.");
      return res.status(400).json({ message: "Email already verified" });
    }

    console.log("User is not verified, updating now...");
    user.isVerified = true; // This should only execute if user.isVerified was false
    await user.save();

    console.log("After updating:", user);
    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying email" });
  }
};
