import { IEmailService } from "./EmailService.js";

export class MockedEmailService implements IEmailService {
  constructor() {}
  called = 0;
  mails: {
    sender: string;
    target: string;
    subject: string;
    html_content: string;
    text_content: string;
  }[] = [];

  async send_email(obj: {
    sender: string;
    target: string;
    subject: string;
    html_content: string;
    text_content: string;
  }): Promise<void> {
    this.called += 1;
    this.mails.push(obj);
    return;
  }
}
