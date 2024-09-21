import { IEmailService } from "./EmailService.js";

export class MockedEmailService implements IEmailService {
  constructor() {}
  async send_email(): Promise<void> {
    return;
  }
}
