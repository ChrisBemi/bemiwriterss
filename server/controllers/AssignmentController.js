const Assignment = require("../models/Assignment.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../models/Users.model");
const generateUniqueFilename = require("../utils/generateUniqueFilename");
const admin = require("firebase-admin");
require("dotenv").config();
const bucket = admin.storage().bucket();
const upload = multer({ storage: multer.memoryStorage() });
const DateGenerator = require("../utils/DateGenerator");

const { transporter } = require("../utils/transporter");

const parseDateString = require("../utils/DateGenerator");

const validateAssignment = (data) => {
  const errors = {};
  if (!data.subject) errors.subject = "Subject is required";
  if (!data.dateline) errors.dateline = "Dateline is required";
  if (!data.time) errors.time = "Time is required";
  if (!data.category) errors.category = "Category is required";
  if (!data.charges) errors.charges = "Charges are required";
  if (!data.clientCharges) errors.clientCharges = "Client charges";
  if (!data.clientName) errors.clientName = "Client names are required ";
  if (!data.page && !data.words) {
    errors.page = "Either Pages or Words is required";
    errors.words = "Either Pages or Words is required";
  }
  return errors;
};
const createAssignment = async (req, res, next) => {
  const {
    page,
    words,
    subject,
    dateline,
    time,
    category,
    charges,
    description,
    clientCharges,
    clientName,
  } = req.body;

  const errors = validateAssignment(req.body);

  let emails = [];
  try {
    const users = await User.find({}, { email: 1 });
    emails = users.map((user) => user.email);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch users" });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
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

    const newAssignment = new Assignment({
      page,
      words,
      subject,
      dateline,
      time,
      category,
      charges,
      clientName,
      clientCharges,
      description: description || "",
      files: uploadedFiles.map((file) => ({
        fileName: file.fileName,
        downloadURL: file.downloadURL,
      })),
    });

    await transporter.sendMail({
      from: `"BM WRITERS" <${process.env.COMPANY_EMAIL}>`,
      bcc: emails,
      subject: `New Assignments Available – Place Your Bids Now!`,
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
              <h1>New Assignments Alert!</h1>
            </div>
            <div class="content">
              <p>Dear writer!,</p>
              <p>We are excited to inform you that new assignments have been uploaded to the BM Writers platform!</p>
              <p>To get started, log in to your account and place your bids on these new assignments. This is a great opportunity to showcase your skills and secure new projects.</p>
              <a href="${process.env.FRONTED_URL}/client/get-orders" class="button">Place Your Bids Now</a>
              <p>If you need any assistance or have questions, please contact our support team.</p>
              <p>Best regards,<br>The BM Writers Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    await newAssignment.save();
    return res
      .status(201)
      .json({ success: true, message: "Assignment created successfully!" });
  } catch (error) {
    next(error);
  }
};

const uploadFiles = upload.array("files", 30);

const getAssignments = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt < 1 || limitInt < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page or limit parameters" });
    }

    const assignments = await Assignment.find()
      .populate({
        path: "writers",
        select:
          "firstName lastName email phoneNo educationLevel qualifications description profile.downloadURL",
      })
      .sort({ subject: 1 });

    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No assignments found" });
    }

    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;
    const totalPages = Math.ceil(assignments.length / limitInt);
    const paginatedAssignments = assignments.slice(startIndex, endIndex);

    const nextPage =
      endIndex < assignments.length
        ? `${process.env.BACKEND_URL}/api/assignments/get?page=${
            pageInt + 1
          }&limit=${limitInt}`
        : null;

    const previousPage =
      startIndex > 0
        ? `${process.env.BACKEND_URL}/api/assignments/get?page=${
            pageInt - 1
          }&limit=${limitInt}`
        : null;

    res.json({
      success: true,
      limit: limitInt,
      page: pageInt,
      totalPages,
      nextPage,
      previousPage,
      data: paginatedAssignments,
    });
  } catch (error) {
    next(error);
  }
};

const getUnassignedAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ assigned: false })
      .populate({
        path: "writers",
        select:
          "firstName lastName email phoneNo educationalLevel qualifications description",
      })
      .sort({ orderId: -1 });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

const getAllAssignments = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt < 1 || limitInt < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page or limit parameters" });
    }

    const totalAssignments = await Assignment.countDocuments();

    const assignments = await Assignment.find({})
      .populate({
        path: "writers",
        select:
          "firstName lastName email phoneNo educationalLevel qualifications description",
      })
      .sort({ completed: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt);

    const totalPages = Math.ceil(totalAssignments / limitInt);
    const nextPage =
      pageInt < totalPages
        ? `${process.env.BACKEND_URL}/api/assignments/getAll?page=${
            pageInt + 1
          }&limit=${limitInt}`
        : null;
    const previousPage =
      pageInt > 1
        ? `${process.env.BACKEND_URL}/api/assignments/getAll?page=${
            pageInt - 1
          }&limit=${limitInt}`
        : null;
    return res.status(200).json({
      success: true,
      status: 200,
      data: assignments,
      page: pageInt,
      limit: limitInt,
      totalPages,
      nextPage,
      previousPage,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (fileName) => {
  try {
    const folder = "assignments/";

    await admin
      .storage()
      .bucket()
      .file(folder + fileName)
      .delete();
    console.log(`File ${fileName} deleted successfully from Firebase Storage.`);
  } catch (error) {
    console.error(
      `Error deleting file ${fileName} from Firebase Storage:`,
      error
    );
    throw error;
  }
};

const deleteAssignment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(200)
        .json({ success: false, message: "Assignment not found" });
    }
    const deleteFilePromises = assignment.files.map(async (file) => {
      try {
        await deleteFile(file.fileName);
      } catch (error) {
        console.error(
          `Error deleting file ${file.fileName} from Firebase Storage:`,
          error
        );
      }
    });

    await Promise.all(deleteFilePromises);

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Assignment and related files deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const addBind = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { writerId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(writerId)
    ) {
      return res.status(200).json({
        success: false,
        message: "Invalid assignment ID or writer ID",
      });
    }
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(200).json({
        success: false,
        message: "Assignment not found in the database",
      });
    }

    if (!assignment.writers.includes(writerId)) {
      assignment.bid += 1;
      assignment.bidedAt = DateGenerator();
      assignment.writers.push(writerId);

      await assignment.save();

      return res.status(200).json({
        success: true,
        message: "Interest created successfully",
        data: assignment,
      });
    } else {
      return res.status(200).json({
        success: false,
        message:
          "You have already expressed interest in this assignment. Please wait for a response from the company.",
        data: assignment,
      });
    }
  } catch (error) {
    return next(error);
  }
};

const checkIfUserHasBind = async (req, res, next) => {
  const { writerId, orderId } = req.params;
  try {
    const assignment = await Assignment.findById(orderId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "We don't have such order in the system",
        data: null,
      });
    }

    if (assignment.writers.map((w) => w.toString()).includes(writerId)) {
      return res.status(200).json({
        success: true,
        message:
          "You have already expressed interest in this work, wait for response from the company",
        data: assignment,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "You have not expressed interest in this work yet",
        data: assignment,
      });
    }
  } catch (error) {
    next(error);
  }
};

const removeBid = async (req, res, next) => {
  try {
    const { orderId, writerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(writerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId or writer ID",
      });
    }

    const assignment = await Assignment.findById(orderId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "There is no such assignment in the database",
      });
    }

    if (assignment.writers.includes(writerId)) {
      const nowDate = new Date(DateGenerator());
      const oldDate = parseDateString(assignment.bidedAt);
      const timeDifference = (nowDate - oldDate) / (1000 * 60 * 60); // Time difference in hours

      if (timeDifference > 3) {
        return res.status(400).json({
          success: false,
          message: "You cannot remove the bid after 3 hours",
        });
      }

      assignment.bid -= 1;
      assignment.writers = assignment.writers.filter(
        (wId) => wId.toString() !== writerId
      );
      await assignment.save();
      return res.status(200).json({
        success: true,
        message: "Bid removed successfully",
        data: assignment,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "You have not placed a bid on this assignment",
      });
    }
  } catch (error) {
    next(error);
  }
};

const assignAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const { writerId } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    const user = await User.findById(writerId);
    if (!assignment || !user) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "Assignment or user not found in the system",
      });
    } else {
      assignment.assigned = true;

      assignment.assignedTo = writerId;

      assignment.assignedAt = DateGenerator();
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
                <h1>You have been assigned '${assignment.subject.toUpperCase()}' with orderId: ${
          assignment.orderId
        }</h1>
              </div>
              <div class="content">
                <p>We are pleased to inform you that you have been assigned a new assignment on the BM Writers platform!</p>
                <p>Please log in to your account progress page to view the assignment details and begin working on it. Make sure to adhere to the given deadline and provide quality work.</p>
                <a href="${
                  process.env.FRONTEND_URL
                }/writer/in-progress" class="button">View Assignment</a>
                <p>If you need any assistance or have questions, please contact our support team.</p>
                <p>Best regards,<br>The BM Writers Team</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      await assignment.save();

      return res.status(200).json({
        success: true,

        message: "The writer has successfully been assigned",

        data: assignment,
      });
    }
  } catch (error) {
    next(error);
  }
};

const assignSingleWriterAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User not found",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(200).json({
        success: false,
        message: "Assignment not found in the system",
      });
    }
    if (assignment.writers.includes(user._id)) {
      return res.status(200).json({
        success: false,
        message: "This writer is already assigned to the assignment",
      });
    }

    assignment.assigned = true;
    assignment.writers.push(user._id);
    assignment.assignedTo = user._id;
    assignment.bid += 1;
    assignment.assignedAt = DateGenerator();
    await transporter.sendMail({
      from: `"BM WRITERS" <${process.env.COMPANY_EMAIL}>`,
      cc: user.email,
      subject: `Dear ${user.firstName} ${user.lastName},`,
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
              <h1>You have been assigned '${assignment.subject}' with orderId: ${assignment.orderId}</h1>
            </div>
            <div class="content">
              <p>We are pleased to inform you that you have been assigned a new assignment on the BM Writers platform!</p>
              <p>Please log in to your account to view the assignment details and begin working on it. Make sure to adhere to the given deadline and provide quality work.</p>
              <a href="${process.env.FRONTEND_URL}/writer/in-progress" class="button">View Assignment</a>
              <p>If you need any assistance or have questions, please contact our support team.</p>
              <p>Best regards,<br>The BM Writers Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    await assignment.save();
    return res.status(200).json({
      success: true,
      message: "The writer has been successfully assigned",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const cancelAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { writerId } = req.body;

    if (!assignmentId || !writerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid assignmentId and writerId",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const newWriters = assignment.writers.filter(
      (writer) => writer.toString() !== writerId
    );

    if (newWriters.length === assignment.writers.length) {
      return res.status(404).json({
        success: false,
        message: "Writer not found in the assignment",
      });
    }

    assignment.writers = newWriters;
    assignment.assigned = false;
    assignment.assignedTo = null;
    assignment.bid -= 1;

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Successfully cancelled",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignedAssignments = async (req, res, next) => {
  try {
    const assignedAssignments = await Assignment.find({ assigned: true });

    if (!assignedAssignments) {
      return res
        .status(404)
        .json({ success: false, message: "There are no assigned assignments" });
    } else {
      return res.status(200).json({ success: true, data: assignedAssignments });
    }
  } catch (error) {
    next(error);
  }
};

// UpdateAssingments

// Update file
const updateAssignmentFiles = async (req, res, next) => {
  const { id } = req.params;
  const files = req.files;
  const { existingFiles } = req.body;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const bucket = admin.storage().bucket();
        const folder = "assignments/";
        const fileName = generateUniqueFilename(file.originalname);
        const fileUpload = bucket.file(folder + fileName);

        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        stream.on("error", (err) => {
          console.error("Error uploading file to Firebase:", err);
          throw new Error("File upload failed");
        });

        stream.on("finish", async () => {
          const downloadURL = await fileUpload.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          });

          assignment.files.push({
            fileName: fileName,
            downloadURL: downloadURL[0],
          });

          await assignment.save();
        });
        stream.end(file.buffer);
        return { fileName, downloadURL: null };
      })
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded and URLs stored successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error updating assignment files:", error);
    next(error);
  }
};

// Update description

const updateAssignmentDescription = async (req, res, next) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    assignment.description = description;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment description updated successfully",
      assignment: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignmentDateline = async (req, res, next) => {
  const { id } = req.params;

  const { dateline } = req.body;

  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    assignment.dateline = dateline;

    await assignment.save();

    res.status(200).json({
      success: true,

      message: "Assignment dateline updated successfully",

      assignment: assignment,
    });
  } catch (error) {
    next(error);
  }
};
const updateAssignmentPenalties = async (req, res, next) => {
  const { assignmentId } = req.params;

  const { penalties } = req.body;

  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res
        .status(200)
        .json({ status: 404, success: false, message: "Assignment not found" });
    }

    assignment.penalty = penalties;

    await assignment.save();

    return res.status(200).json({
      success: true,

      status: 200,

      message: "Assignment penalties updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIfUserHasBind,
  uploadFiles,
  createAssignment,
  validateAssignment,
  getAssignments,
  deleteAssignment,
  addBind,
  removeBid,
  assignAssignment,
  getAssignedAssignments,
  updateAssignmentDateline,
  updateAssignmentDescription,
  updateAssignmentFiles,
  getUnassignedAssignments,
  getAllAssignments,
  assignSingleWriterAssignment,
  cancelAssignment,
  updateAssignmentPenalties,
};
