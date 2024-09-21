import { EmailService } from "./EmailService.js";

describe("email service", () => {
  it("should be able to send emails", async () => {
    const service = EmailService.fromEnv();

    await service.send_email({
      html_content: "<b>Halo</b>",
      text_content: "Halo halo",
      subject: "Testing",
      sender: "testing",
      target: "user@example.com",
    });
  });
});
