const User = require("../models/Users.model");

require("dotenv").config();

const nodemailer = require("nodemailer");

const { transporter } = require("../utils/transporter");

const getPendingApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt < 1 || limitInt < 1) {
      return res.status(200).json({
        status: 400,
        success: false,
        message: "Invalid page or limit parameters",
      });
    }

    const pendingApplications = await User.find({ pending: false }).sort({
      systemId: -1,
    });

    if (!pendingApplications || pendingApplications.length === 0) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "There are no pending applications at the moment",
      });
    }

    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;
    const totalPages = Math.ceil(pendingApplications.length / limitInt);
    const paginatedApplications = pendingApplications.slice(
      startIndex,
      endIndex
    );

    const nextPage =
      endIndex < pendingApplications.length
        ? `${process.env.BACKEND_URL}/api/applications/get/pending?page=${
            pageInt + 1
          }&limit=${limitInt}`
        : null;

    const previousPage =
      startIndex > 0
        ? `${process.env.BACKEND_URL}/api/applications/get/pending?page=${
            pageInt - 1
          }&limit=${limitInt}`
        : null;

    return res.status(200).json({
      status: 200,
      success: true,
      limit: limitInt,
      page: pageInt,
      totalPages,
      nextPage,
      previousPage,
      data: paginatedApplications,
    });
  } catch (error) {
    next(error);
  }
};

const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "Application not found!",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "User rejected and cleared from the system!",
    });
  } catch (error) {
    next(error);
  }
};

const approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(200).json({
        success: false,
        status: 404,
        message: "User not found in the system!",
      });
    }
    user.pending = true;

    await transporter.sendMail({
      from: `"BM WRITERS" <${process.env.COMPANY_EMAIL}>`,
      to: user.email,
      subject: `Congratulations! Your Application Has Been Approved`,
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
              border-radius:2px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color:#130252;
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
              background-color:#130252;;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 25px;
              border-radius:2px;
              margin-top: 20px;
              font-weight: bold;
              text-transform: uppercase;
            }
            a{
            color:"#fff"
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
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>We are pleased to inform you that your application to join BM Writers has been successfully approved!</p>
              <p>Your credentials have been reviewed, and you are now officially part of our team. We look forward to your contributions and hope you have a rewarding experience with us.</p>
              <a href="${process.env.FRONTED_URL}/login" class="button">Login to Your Account</a>
              <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The BM Writers Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    await user.save();
    return res.status(200).json({
      success: true,
      status: 200,
      message: "User successfully approved to enjoy the platform",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingApplications,
  rejectApplication,
  approveApplication,
};
