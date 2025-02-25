import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY", // Check this API key!
    url: "https://api.eu.mailgun.net/v3", // or use https://api.eu.mailgun.net/v3 for EU domains
  });

  try {
    const data = await mg.messages.create("snapedev.com", {
      from: "Mailgun Sandbox <postmaster@snapedev.com>", // Verify this address is valid
      to: ["Jack Snape <jacksnapephotography@outlook.com>"],
      subject: "Hello Jack Snape",
      text: "Congratulations Jack Snape, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.log("Response:", error.response); // More detailed error response
    }
  }
}

sendSimpleMessage();
