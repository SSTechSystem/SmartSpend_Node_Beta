const nodemailer = require("nodemailer");
const { SMTP_DETAILS } = require("../constant/constant.json");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  requireTLS: true,
  auth: {
    user: SMTP_DETAILS.EMAIL,
    pass: SMTP_DETAILS.PASSWORD,
  },
});

const sendMail = async (to, subject, data) => {
  try {
    const info = await transporter.sendMail({
      from: `SmartSpend < ${SMTP_DETAILS.EMAIL} >`,
      to,
      bcc: "",
      subject: subject || "SmartSpend",
      html: data,
      //   html: `
      //   <p>Hello,
      //   <br/><br/>
      //  Your Authorization code is following,</p>
      //   <p>Authorization Code: <b>${data}</b></p>

      //   Thanks,<br/>
      //   QuickChat App Team</p>
      // `,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendEmailForQuery = async (
  replyTo,
  subject,
  first_name,
  last_name,
  email,
  message
) => {
  try {
    const info = await transporter.sendMail({
      from: `SmartSpend < ${SMTP_DETAILS.EMAIL} >`,
      replyTo,
      to: "support@sstechstudio.com",
      subject: "New Inquiry Request",
      html: `
    <p>Dear Administrator,</p>
    <p>I wanted to inform you that a new request has been received. Below are the details:</p>
    <ul>
      <li><strong>First Name:</strong> ${first_name}</li>
      <li><strong>Last Name:</strong> ${last_name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Message:</strong> ${message}</li>
    </ul>
    <p>Please review this request at your earliest convenience and take necessary action accordingly.</p>
    <p>Thank you for your attention to this matter.</p>
 
    `,
    });
    console.log("Message sent: %s", info);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendMail, sendEmailForQuery };
