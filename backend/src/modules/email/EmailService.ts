type EmailCredentials = {
  private_key: string;
  public_key: string;
};

export class EmailService {
  private email_credentials: EmailCredentials;
  constructor(email_credentials: EmailCredentials) {
    this.email_credentials = email_credentials;
  }

  async send_email(obj: {
    sender: string;
    target: string;
    subject: string;
    html_content: string;
    text_content: string;
  }) {
    const { sender, target, subject, html_content, text_content } = obj;
    const data = {
      Messages: [
        {
          From: {
            Email: sender,
          },
          To: [
            {
              Email: target,
            },
          ],
          Subject: subject,
          HTMLPart: html_content,
          TextPart: text_content,
        },
      ],
    };

    const auth_key = Buffer.from(
      `${this.email_credentials.public_key}:${this.email_credentials.private_key}`,
    ).toString("base64");

    const request = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth_key}`,
      },
      body: JSON.stringify(data),
    });

    if (request.status != 200) {
      throw new Error("Failed to send email!");
    }
  }
}
