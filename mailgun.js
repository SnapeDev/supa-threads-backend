import FormData from "form-data";
import Mailgun from "mailgun.js";

export async function sendEmail(to, subject, text) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    url: "https://api.eu.mailgun.net/v3",
  });

  try {
    const data = await mg.messages.create("snapedev.com", {
      from: "Supa Threads <postmaster@snapedev.com>",
      to: to, // customer email
      subject: subject, // email subject
      text: text, // email body
    });

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Propagate the error for handling in webhook
  }
}
