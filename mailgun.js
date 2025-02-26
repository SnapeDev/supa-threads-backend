import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmail(to, subject, text) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = "snapedev.com";
  const url = `https://api.eu.mailgun.net/v3/${domain}/messages`;

  const data = new URLSearchParams();
  data.append("from", "Supa Threads <postmaster@snapedev.com>");
  data.append("to", to);
  data.append("subject", subject);
  data.append("text", text);

  try {
    const response = await axios.post(url, data, {
      auth: {
        username: "api",
        password: apiKey,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    throw error;
  }
}
