import { IEmailService } from "./EmailService.js";

export class MockedEmailService implements IEmailService {
  constructor() {}
  called = 0;
  async send_email(): Promise<void> {
    this.called += 1;
    return;
  }
}
