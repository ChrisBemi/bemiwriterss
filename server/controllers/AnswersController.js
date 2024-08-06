const express = require("express");
const Answer = require("../models/Answers.model");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const DateGenerator = require("../utils/DateGenerator");
const archiver = require("archiver");
const Assignment = require("../models/Assignment.model");
const nodemailer = require("nodemailer");
require("dotenv").config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS);
const generateUniqueFilename = require("../utils/generateUniqueFilename");
const { Storage } = require("@google-cloud/storage");
const admin = require("firebase-admin");
const { updateAssignmentPenalty } = require("./AssignmentController");
const { transporter } = require("../utils/transporter");
const bucket = admin.storage().bucket();

const upload = multer({ storage: multer.memoryStorage() });
const uploadFiles = upload.array("files", 30);

const submitAnswers = async (req, res, next) => {
  const { assignmentId, description, writerId, category } = req.body;

  if (!assignmentId) {
    return res
      .status(200)
      .json({ success: false, message: "Assignment ID is required" });
  }

  if (!category) {
    return res
      .status(200)
      .json({ success: false, message: "Category is required" });
  }

  try {
    const uploadTasks = (req.files || []).map(async (file) => {
      const fileName = generateUniqueFilename(file.originalname);
      const fileBuffer = file.buffer;
      const folder = "answers/";
      const fileRef = bucket.file(folder + fileName);

      await fileRef.save(fileBuffer);
      const downloadURL = await fileRef.getSignedUrl({
        action: "read",
        expires: "01-01-2026",
      });

      return { fileName, downloadURL: downloadURL[0] };
    });

    const uploadedFiles = await Promise.all(uploadTasks);

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid assignment ID" });
    }

    if (category === "final") {
      assignment.inReview = true;
      assignment.completed = false;
      assignment.inRevision = false;
    }

    assignment.submittedAt = DateGenerator();

    const newAnswer = new Answer({
      assignmentId,
      description,
      writerId,
      submittedAt: DateGenerator(),
      files: uploadedFiles.map((file) => ({
        fileName: file.fileName,
        downloadURL: file.downloadURL,
      })),
      category,
    });

    await assignment.save();
    await newAnswer.save();

    res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      answer: newAnswer,
    });
  } catch (error) {
    next(error);
  }
};

const getSubmittedAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({}).populate([
      {
        path: "writerId",
        select: "firstName lastName email",
      },
      {
        path: "assignmentId",
        select: "subject charges penalty completed subject orderId completedAt",
      },
    ]);

    if (!answers || answers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "There are no answers in the system currently",
      });
    }

    return res.status(200).json({ success: true, data: answers });
  } catch (error) {
    next(error);
  }
};

// Adjust the path according to your project structure

const setRevision = async (req, res) => {
  const { answerId } = req.params;
  const { comment, email, orderId } = req.body;

  if (!comment) {
    return res
      .status(400)
      .json({ success: false, message: "Comment is required" });
  }

  try {
    const answer = await Answer.findById(answerId);
    const assignment = await Assignment.findById(orderId);

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (answer.inRevision && assignment.inRevision) {
      return res
        .status(200)
        .json({ success: true, message: "The answer is still in revision" });
    }

    const uploadTasks = (req.files || []).map(async (file) => {
      const fileName = generateUniqueFilename(file.originalname);
      const fileBuffer = file.buffer;
      const folder = "assignments/";
      const fileRef = bucket.file(folder + fileName);

      await fileRef.save(fileBuffer);

      const downloadURL = await fileRef.getSignedUrl({
        action: "read",
        expires: "01-01-2026",
      });

      return { fileName, downloadURL: downloadURL[0] };
    });

    const uploadedFiles = await Promise.all(uploadTasks);

    assignment.inRevision = true;
    answer.inRevision = true;
    assignment.inRevisionComment = comment;
    assignment.inRevisionFiles = uploadedFiles;
    assignment.completed = false;

    await transporter.sendMail({
      from: `"BM WRITERS" <${process.env.COMPANY_EMAIL}>`,
      cc: user.email,
      subject: `Dear writer,`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              background-color: #f4f4f4;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 2px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #130252;
              color: #ffffff;
              text-align: center;
              padding: 15px;
              border-radius: 2px 2px 0 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
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
            .button:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The assignment you did with subject '${assignment.subject.toUpperCase()}' with orderId: ${
        assignment.orderId
      }</h1>
            </div>
            <div class="content"> 
              <p>We are pleased to inform you that the assignment you did on ${
                assignment.subject
              } has been set into revision after careful consideration.</p>
              <p>Please log in to your account's revision page to view the assignment details and begin working on it. Make sure to adhere to the given deadline and provide quality work.</p>
              <a href="${
                process.env.FRONTEND_URL
              }/client/in-revision" class="button">View Assignment</a>
              <p>If you need any assistance or have questions, please contact our support team.</p>
              <p>Best regards,<br>The BM Writers Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    await assignment.save();
    await answer.save();
    return res
      .status(200)
      .json({ success: true, message: "In revision has been set!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
const cancelInRevision = async (req, res, next) => {
  try {
    const { answerId, assignmentId } = req.params;

    if (!answerId || !assignmentId) {
      return res.status(200).json({
        success: false,
        message: "The answer Id and assignment Id are required",
      });
    }

    const answer = await Answer.findById(answerId);
    const assignment = await Assignment.findById(assignmentId); // Correct the model

    if (!answer) {
      return res.status(200).json({
        success: false,
        message: "The answer was not found in the store",
      });
    }

    if (!assignment) {
      return res.status(200).json({
        success: false,
        message: "The assignment was not found in the store",
      });
    }

    answer.inRevision = false;
    assignment.inRevision = false;

    await Promise.all([answer.save(), assignment.save()]);

    return res.status(200).json({
      success: true,
      message: "In revision has been cancelled!",
    });
  } catch (error) {
    next(error);
  }
};

const downloadAnsweredFiles = async (req, res, next) => {
  const { answerId } = req.params;
  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    if (!answer.files || answer.files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files found for this assignment",
      });
    }

    const zipFileName = `answers_${answerId}_files.zip`;
    const outputFilePath = path.join(__dirname, `../downloads/${zipFileName}`);
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
    });

    output.on("close", function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log(
        "archiver has been finalized and the output file descriptor has closed."
      );

      res.download(outputFilePath, zipFileName, (err) => {
        if (err) {
          console.error("Download error:", err);
          next(err);
        } else {
          console.log(`Download successful: ${zipFileName}`);
          // Delete the zip file after successful download
          fs.unlinkSync(outputFilePath);
          console.log(`Deleted ${zipFileName} after download.`);
        }
      });
    });
    archive.on("error", function (err) {
      console.error("Archiving error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create zip file",
      });
    });
    archive.pipe(output);
    answer.files.forEach((file) => {
      const filePath = path.join(__dirname, `../uploads/answers/${file}`);
      archive.file(filePath, { name: file });
    });
    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

const getUsersInRevisionWork = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    if (!writerId) {
      return res
        .status(400)
        .json({ success: false, message: "WriterId is required" });
    }

    const answers = await Answer.find({
      writerId: writerId,
      inRevision: true,
    }).populate({
      path: "assignmentId",
      match: { inRevision: true },
      select:
        "subject dateline description orderId files inRevisionComment inRevision inRevisionFiles submittedAt",
    });
    const filteredAnswers = answers.filter(
      (answer) => answer.assignmentId && answer.assignmentId.inRevision === true
    );
    if (filteredAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No answers found in revision",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data successfully fetched",
      data: filteredAnswers,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnswer = async (req, res, next) => {
  const { answerId } = req.params;
  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }
    const folder = "answers/";

    if (answer.files && answer.files.length > 0) {
      const promises = answer.files.map(async (file) => {
        const filePath = folder + file.fileName;

        await admin.storage().bucket().file(filePath).delete();
      });
      await Promise.all(promises);
    }

    await Answer.findByIdAndDelete(answerId);
    res.status(200).json({
      success: true,
      message: "Answer and associated files deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAnswers,
  getSubmittedAnswers,
  uploadFiles,
  setRevision,
  cancelInRevision,
  downloadAnsweredFiles,
  getUsersInRevisionWork,
  deleteAnswer,
};
