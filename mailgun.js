import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";

dotenv.config();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // Use API Key from Mailgun
  url: "https://api.mailgun.net", // Default Mailgun API URL
});

export const sendEmail = async (to, subject, text) => {
  try {
    const messageData = {
      from: `Supa Threads <no-reply@supathreads.com>`,
      to,
      subject,
      text,
    };

    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );
    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
