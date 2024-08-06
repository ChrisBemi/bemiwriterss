const User = require("../models/Users.model");

const admin = require("firebase-admin");

const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const bucket = admin.storage().bucket();

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const generateUniqueFilename = 
require("../utils/generateUniqueFilename");

const bcrypt = require("bcrypt")

require("dotenv").config();

const deleteExistingFile = async (fileName) => {
  try {
    const file = bucket.file(fileName);
    await file.delete();
    console.log(`Successfully deleted ${fileName}`);
  } catch (error) {
    console.error(`Failed to delete ${fileName}:`, error.message);
  }
};

const updateProfileImage = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.profile && user.profile.fileName) {
      await deleteExistingFile(user.profile.fileName);
    }
    const fileName = `profileImages/${generateUniqueFilename(
      file.originalname
    )}`;
    const fileBuffer = file.buffer;
    const fileRef = bucket.file(fileName);

    await fileRef.save(fileBuffer);
    const downloadURL = (
      await fileRef.getSignedUrl({
        action: "read",
        expires: "01-01-2026",
      })
    )[0];

    user.profile = { fileName, downloadURL };
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updateUserNames = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName } = req.body;

  if (!firstName && !lastName) {
    return res.status(200).json({
      success: false,
      message:
        "Please provide at least one of the fields: firstName or lastName.",
    });
  }

  try {
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(200)
        .json({ success: false, message: "User not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Name updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the user." });
  }
};

const updateEmail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }

    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      return res
        .status(200)
        .send({ success: false, message: "Email is already in use" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "9m",
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"BEMI EDITORS LIMITED" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `EMAIL CHANGE VERIFICATION`,
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
         border-radius: 5px;
         width:"100%;
         box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
       }
       /* Header styles */
       .header {
         background-color: #4CAF50;
         color: #ffffff;
         text-align: center;
         padding: 10px;
         border-radius: 5px 5px 0 0;
          width:"100%;
       }
       /* Content styles */
       .content {
        width:"100%;
         padding: 20px;
       }
       /* Button styles */
       .button {
         display: inline-block;
         background-color: #4CAF50;
         color: #ffffff;
         text-decoration: none;
         padding: 10px 20px;
         border-radius: 5px;
         margin-top: 20px;
       }
       .button:hover {
         background-color: #45a049;
       }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>BEMI EDITORS LIMITED</h1>
       </div>
       <div class="content">
         <p>Dear User,</p>
        <p>Please click this link within 9 minutes to verify that you want to change the email by clicking the button below:</p>
      <a href="${process.env.FRONTED_URL}/authentication/verify-email?token=${token}&email=${email}" class="button">Verify Email</a>
       </div>
     </div>
   </body>
   </html>
   `,
    });

    return res.status(200).json({
      success: true,
      message: "Email verification sent to your email. Kindly confirm.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(200).json({
      success: false,
      message: "Token and email are required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User not found",
      });
    }

    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      return res.status(200).json({
        success: false,
        message: "Email is already in use",
      });
    }

    // Update the user's email
    user.email = email;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(200).json({
        success: false,
        message: "Token has expired",
      });
    }
    next(error);
  }
};


const updateProfilePassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    if (!userId) {
      return res.status(200).json({ success: false, message: 'UserId required' });
    }
    if (!password) {
      return res.status(200).json({ success: false, message: 'Password required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(204).json({ success: false, message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUserNames,
  upload,
  updateProfileImage,
  updateEmail,
  verifyEmail,
  updateProfilePassword
};
