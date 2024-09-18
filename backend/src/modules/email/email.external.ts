import { EmailService } from "./EmailService.js";

describe("email service", () => {
  it("should be able to send emails", async () => {
    const public_key = process.env.BACKEND_MAIL_PUBLIC;
    const private_key = process.env.BACKEND_MAIL_PRIVATE;

    if (public_key == undefined || private_key == undefined) {
      throw new Error("Cannot configure email credentials for unmocked test!");
    }

    const service = new EmailService({
      private_key,
      public_key,
    });

    await service.send_email({
      html_content: "<b>Halo</b>",
      text_content: "Halo halo",
      subject: "Testing",
      sender: "testing@example.com",
      target: "user@example.com",
    });
  });
});
