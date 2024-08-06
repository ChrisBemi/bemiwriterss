const nodemailer = require("nodemailer");

const sendBulkEmail = async (req, res) => {
  const { emails, subject, message } = req.body; // Assuming emails, subject, and message are in the request body

  // Validate request body
  if (!emails || !subject || !message) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Emails, subject, and message are required in the request body",
      });
  }

  try {
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD,
      },
    });

    // Send email to multiple recipients
    
    const info = await transporter.sendMail({
      from: `"BEMI EDITORS LIMITED" <${process.env.COMPANY_EMAIL}>`,
      bcc: emails, // Array of recipient email addresses
      subject: subject,
      text: message,
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
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            /* Header styles */
            .header {
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
              padding: 10px;
              border-radius: 5px 5px 0 0;
            }
            /* Content styles */
            .content {
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
              <h1>${subject}</h1>
              <p>${message}</p>
            </div>
          </div>
        </body>
        </html>
        `,
    });

    console.log("Bulk email sent:", info.response);
    res
      .status(200)
      .json({ success: true, message: "Bulk email sent successfully" });
  } catch (error) {
    console.error("Error sending bulk email:", error.message);
    res.status(500).json({ success: false, message: "Failed to send emails" });
  }
};

module.exports = { sendBulkEmail };
