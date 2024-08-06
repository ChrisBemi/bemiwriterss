const User = require("../models/Users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const nodemailer = require("nodemailer");

const { serialize } = require("cookie");

const { transporter } = require("../utils/transporter");

const signup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    password,
    educationLevel,
    qualifications,
  } = req.body;
  try {
    const existingEmailInApplication = await User.find({
      email: email,
      pending: false,
    });

    if (existingEmailInApplication.length > 0) {
      return res.status(200).json({
        status: 409,
        success: false,
        email: "A user with this email has made an application",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(200).json({
        status: 409,
        success: false,
        email: "The email already exists",
      });
    }
    const existingPhone = await User.findOne({ phoneNo });
    if (existingPhone) {
      return res.status(200).json({
        status: 409,
        success: false,
        phone: "The phone number already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const adminEmails = [
      "ritahchanger@gmail.com",
      "bedanc.chege@gmail.com",
      "peterdennis573@gmail.com",
      "bemieditors@gmail.com",
    ];
    const role = adminEmails.includes(email) ? "admin" : "writer";
    const pending = adminEmails.includes(email) ? true : false;
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNo,
      educationLevel,
      qualifications,
      role,
      pending,
      password: hashedPassword,
    });

    await transporter.sendMail({
      from: `"BM WRITERS" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Your Application Was Successful!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset styles and basic typography */
            body, html {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              background-color: #f4f4f4;
              color: #333;
            }
            /* Container styles */
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius:2px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            /* Header styles */
            .header {
              background-color:#130252;
              color: #ffffff;
              text-align: center;
              padding: 15px;
              border-radius: 8px 8px 0 0;
            }
            /* Content styles */
            .content {
              padding: 20px;
              text-align: center;
            }
            /* Button styles */
            .button {
              display: inline-block;
              background-color:#130252;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 2px;
              margin-top: 20px;
              font-weight: bold;
              text-transform: uppercase;
            }
              a{
              color:"#fff";
              }
            .button:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Congratulations!</h1>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>
              <p>We are delighted to inform you that your application to join BM Writers Limited has been successfully received!</p>
              <p>Our team will review your credentials, and if they meet our requirements, you will receive a follow-up email notifying you of your acceptance.</p>
              <p>In the meantime, feel free to explore our website and get familiar with our services. We look forward to potentially having you on board!</p>
              <a href="${process.env.FRONTED_URL}" class="button">Visit Our Website</a>
              <p>If you have any questions or need further information, please do not hesitate to contact us.</p>
              <p>Best regards,<br>The BM WRITERS TEAM</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    await newUser.save();
    res.status(200).json({
      status: 201,
      success: true,
      message:
        "Application done successfully, once approved you'll receive an email notification",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { password, email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ status: 404, success: false, error: "Email not found" });
    }

    if (!user.pending) {
      return res.status(200).json({
        status: 200,
        success: false,
        error: "The application is still underway",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .json({ status: 400, success: false, error: "Incorrect password" });
    }

    const payload = {
      id: user._id, // Assuming MongoDB ObjectId
      email: user.email,
      // Include any other necessary user information
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Serialize token into a string for the cookie header
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/",
    };
    res.cookie("token", token, cookieOptions);

    res
      .status(200)
      .json({ status: 200, success: true, user: payload, token: token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(200).json({ success: false, error: "Server error" });
  }
};

const logout = (req, res) => {
  const { cookies } = req;
  const jwtToken = cookies.token;

  if (!jwtToken) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1, // Expires the cookie immediately
      path: "/",
    };

    const serialized = serialize("token", null, cookieOptions);
    res.setHeader("Set-Cookie", serialized);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

const checkAuthStatus = async (req, res) => {
  const { cookies } = req;
  const token = cookies.token;

  if (!token) {
    return res.status(200).json({ status: 401, isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ isLoggedIn: false });
    }

    res.status(200).json({ isLoggedIn: true, user_id: user._id });
  } catch (error) {
    console.error("Error checking authentication status:", error);
    res.status(500).json({ isLoggedIn: false });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .send({ status: 404, success: false, email: "User not found" });
    }
    const encodedEmail = encodeURIComponent(email);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });

    await transporter.sendMail({
      from: `"BM WRITERS" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Change password!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset styles and basic typography */
            body, html {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              background-color: #f4f4f4;
              color: #333;
            }
            /* Container styles */
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 2px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            /* Header styles */
            .header {
              background-color: #130252;
              color: #ffffff;
              text-align: center;
              padding: 15px;
              border-radius: 8px 8px 0 0;
            }
            /* Content styles */
            .content {
              padding: 20px;
              text-align: center;
            }
            /* Button styles */
            .button {
              display: inline-block;
              background-color: #130252;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 2px;
              margin-top: 20px;
              font-weight: bold;
              text-transform: uppercase;
            }
            a {
              color: #ffffff;
            }
            .button:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Congratulations!</h1>
            </div>
            <div class="content">
              <h1>Password Reset Request</h1>
              <p>Please click the link below to reset your password. You have 5 minutes to complete the reset process.</p>
              <p><a class="button" href='${process.env.FRONTED_URL}/change-password/${token}'>Reset Password</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).send({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};


const changePassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(200).json({
      status: 200,
      success: false,
      message: "Token and new password are required",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(200).json({
        status: 200,
        success: false,
        message: "Invalid authentication token",
      });
    }

    // Extract user ID from the token
    const userId = decoded.id;

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Respond with success message
    return res.status(200).json({
      status: 200,
      success: true,
      message: "User password updated",
    });
  } catch (error) {
    console.error("Error updating password:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(200).json({
        status: 400,
        success: false,
        message: "Invalid authentication token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(200).json({
        status: 200,
        success: false,
        message: "Change password time expired!",
      });
    }

    return res.status(200).json({
      status:500,
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  changePassword,
  checkAuthStatus,
};
