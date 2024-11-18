import { compareSync, hashSync } from "bcryptjs";
import { randomInt } from "crypto";
import dayjs from "dayjs";
import { z } from "zod";
import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { EmailService, IEmailService } from "../email/EmailService.js";
import { OTPTypes } from "./UserMisc.js";
import { UserRepository } from "./UserRepository.js";

export function envUserServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const user_repo = new UserRepository(db);
  const email_service = EmailService.fromEnv();
  const user_service = new UserService(user_repo, email_service, transaction_manager);
  return user_service;
}

export function userServiceFactory(
  transaction_manager: TransactionManager,
  email_service: IEmailService,
) {
  const db = transaction_manager.getDB();
  const user_repo = new UserRepository(db);
  const user_service = new UserService(user_repo, email_service, transaction_manager);
  return user_service;
}

export class UserService {
  private user_repo: UserRepository;
  private transaction_manager: TransactionManager;
  private email_service: IEmailService;
  constructor(
    user_repo: UserRepository,
    email_service: IEmailService,
    transaction_manager: TransactionManager,
  ) {
    this.user_repo = user_repo;
    this.email_service = email_service;
    this.transaction_manager = transaction_manager;
  }

  factory(tm: TransactionManager) {
    return userServiceFactory(tm, this.email_service);
  }

  async isAdminUser(user_id: number): Promise<boolean> {
    const user = await this.user_repo.getUserDetail(user_id);
    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan!");
    }
    return user.user_is_admin;
  }

  async getAdminUser(user_id: number): Promise<boolean> {
    const user = await this.user_repo.getUserDetail(user_id);
    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan!");
    }
    return user.user_is_admin;
  }

  async findUserByEmail(email: string) {
    return await this.user_repo.findUserByEmail(email);
  }

  async findUserByName(name: string) {
    return await this.user_repo.findUserByName(name);
  }

  async validateUser(obj: { user_name?: string; user_email?: string }) {
    const { user_name, user_email } = obj;

    const retval: {
      name?: string;
      email?: string;
    } = {};

    if (user_name) {
      const name_valid = z.string().min(1).safeParse(user_name);

      if (!name_valid.success) {
        retval.name = "Nama tersebut invalid!";
      } else {
        const same_name = await this.findUserByName(user_name);
        retval.name = same_name ? "Nama tersebut sudah dipakai pengguna lain!" : undefined;
      }
    }
    if (user_email) {
      const email_valid = z.string().email().min(1).safeParse(user_email);

      if (!email_valid.success) {
        retval.email = "Alamat email tersebut invalid!";
      } else {
        const same_email = await this.findUserByEmail(user_email);
        retval.email = same_email ? "Email tersebut sudah dipakai pengguna lain!" : undefined;
      }
    }

    return retval;
  }

  async addUser(obj: {
    registration_token: string;
    user_name: string;
    user_email: string;
    user_password: string;
    user_education_level?: string;
    user_school?: string;
    user_about_me?: string;
    user_image?: string;
    user_website?: string;
    user_socials?: string[];
    user_location?: string;
    user_workplace?: string;
  }) {
    return await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const { registration_token, user_name, user_password, user_email, user_socials, ...rest } =
        obj;
      const same_name = await serv.user_repo.findUserByName(user_name);
      if (same_name) {
        throw new ClientError("Sudah ada pengguna dengan nama yang sama!");
      }
      const same_email = await serv.findUserByEmail(user_email);
      if (same_email != undefined) {
        throw new ClientError("Sudah ada pengguna dengan email yang sama!");
      }

      if (user_socials != undefined && user_socials.length !== 0) {
        if (new Set(user_socials).size !== user_socials?.length) {
          throw new ClientError("Tidak boleh ada akun sosial media yang terduplikat!");
        }
      }

      await serv.useRegistrationToken(registration_token, user_email);

      const hashed_password = hashSync(user_password, 10);

      return await serv.user_repo.addUser({
        ...rest,
        user_socials,
        user_name,
        user_email,
        hashed_password,
      });
    });
  }

  async sendOTPMail(token: string) {
    const otp = await this.user_repo.getOTP(token);
    if (!otp) {
      throw new NotFoundError("Token tersebut invalid!");
    }
    if (otp.verified) {
      throw new ClientError("OTP sudah diisi!");
    }

    const message = otp.type === "Register" ? "registrasi" : "perubahan password";

    await this.email_service.send_email({
      sender: "noreply",
      target: otp.email,
      subject: "OTP Registrasi Dev4You",
      html_content: `Berikut adalah kode OTP untuk proses ${message} anda:<br/><b>${otp.otp}</b><br/><br/>`,
      text_content: `Berikut adalah kode OTP untuk proses ${message} anda: ${otp.otp}`,
    });
  }

  async verifyOTP(token: string, otp: string) {
    return await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const otp_data = await serv.user_repo.getOTP(token);
      if (!otp_data) {
        throw new ClientError(
          "Kami mendetesi lalu lintas yang tidak lazim pada komputer anda. Silahkan ulangi proses registrasi.",
        );
      }

      if (otp_data.verified) {
        throw new ClientError("Anda sudah memverifikasi alamat email tersebut!");
      }

      const otp_expired = dayjs(otp_data.created_at).add(15, "minute");
      const now = dayjs();
      if (now.isAfter(otp_expired)) {
        throw new ClientError("OTP sudah kedaluwarsa. Silahkan buat ulang kode OTP!");
      }

      if (otp_data.otp !== otp) {
        throw new ClientError("Kode OTP yang anda masukkan salah!");
      }

      await serv.user_repo.updateOTP(token, {
        verified: true,
      });
    });
  }

  private async useRegistrationToken(token: string, user_email: string) {
    const otp = await this.user_repo.getOTP(token);
    if (!otp || user_email !== otp.email || otp.type !== "Register") {
      // Antara token ngasal atau nembak token. Token harusnya dimanage full sama react jadi ga bakal terjadi.
      throw new ClientError(
        "Kami mendeteksi lalu lintas yang tidak lazim pada komputer anda. Silahkan ulangi proses registrasi.",
      );
    }

    if (!otp.verified) {
      throw new ClientError("Anda belum memverifikasi alamat email anda!");
    }

    if (otp.used) {
      throw new ClientError("Akun tersebut sudah terdaftar!");
    }

    const token_expired = dayjs(otp.created_at).add(1, "day");
    const now = dayjs();
    if (now.isAfter(token_expired)) {
      throw new ClientError(
        "Verifikasi email yang anda lakukan sudah kedaluwarsa! Silahkan ulangi proses registrasi.",
      );
    }

    return true;
  }

  private async useResetPasswordToken(token: string, user_email: string) {
    const otp = await this.user_repo.getOTP(token);
    if (!otp || user_email !== otp.email || otp.type !== "Password") {
      // Antara token ngasal atau nembak token. Token harusnya dimanage full sama react jadi ga bakal terjadi.
      throw new ClientError(
        "Kami mendeteksi lalu lintas yang tidak lazim pada komputer anda. Silahkan ulangi proses perubahan password.",
      );
    }

    if (!otp.verified) {
      throw new ClientError("Anda belum memasukkan kode OTP!");
    }

    if (otp.used) {
      throw new ClientError("Token reset password anda sudah digunakan!");
    }

    const token_expired = dayjs(otp.created_at).add(1, "day");
    const now = dayjs();
    if (now.isAfter(token_expired)) {
      throw new ClientError(
        "Verifikasi OTP yang anda lakukan sudah kedaluwarsa! Silahkan ulangi proses ganti password.",
      );
    }

    return true;
  }

  async addOTP(obj: { email: string; type: OTPTypes }) {
    const { type, ...rest } = obj;
    if (type === "Register") {
      return await this.addRegistrationOTP(rest);
    } else {
      return await this.addPasswordOTP(rest);
    }
  }

  private async addRegistrationOTP(obj: { email: string }) {
    const { email } = obj;
    const result = await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const same_email = await serv.findUserByEmail(email);
      if (same_email != undefined) {
        throw new ClientError("Sudah ada pengguna dengan email yang sama!");
      }
      return await serv.user_repo.addOTP({
        type: "Register",
        email,
        otp: randomInt(100000, 1000000).toString(),
      });
    });
    if (result == undefined) {
      throw new Error("Gagal membuat OTP registrasi!");
    }

    this.sendOTPMail(result.token);

    return result;
  }

  private async addPasswordOTP(obj: { email: string }) {
    const { email } = obj;
    const result = await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const same_email = await serv.findUserByEmail(email);
      if (same_email == undefined) {
        throw new ClientError("Tidak menemukan pengguna dengan email tersebut!");
      }
      return await serv.user_repo.addOTP({
        type: "Password",
        email,
        otp: randomInt(100000, 1000000).toString(),
      });
    });

    if (result == undefined) {
      throw new Error("Gagal membuat OTP password!");
    }

    this.sendOTPMail(result.token);

    return result;
  }

  async getUserDetail(user_id: number) {
    return await this.user_repo.getUserDetail(user_id);
  }

  async findUserByCredentials(user_name: string, user_password: string) {
    const user = await this.user_repo.getLoginCredentials(user_name);
    if (!user) {
      return undefined;
    }
    const is_valid = compareSync(user_password, user.password);
    if (is_valid) {
      return { id: user.id, name: user.name };
    } else {
      return undefined;
    }
  }

  async getUsers(opts?: { page?: number; limit?: number; is_admin?: boolean; keyword?: string }) {
    return await this.user_repo.getUsers(opts);
  }

  async countUsers(opts?: { is_admin?: boolean; keyword?: string }) {
    return await this.user_repo.countUsers(opts);
  }

  async isAllowedToModify(user_id: number, sender_id: number) {
    if (user_id == sender_id) {
      return true;
    }
    return await this.isAdminUser(sender_id);
  }

  async updateAccountDetail(
    user_id: number,
    obj: {
      user_name?: string;
      user_email?: string;
      user_education_level?: string | null;
      user_school?: string | null;
      user_about_me?: string | null;
      user_image?: string | null;
      user_password?: string | null;
      user_website?: string | null;
      user_socials?: string[];
      user_location?: string | null;
      user_workplace?: string | null;
    },
    sender_id: number,
  ) {
    return await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const isAllowed = await serv.isAllowedToModify(user_id, sender_id);
      if (!isAllowed) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah profil ini!");
      }

      const { user_name, user_password, user_email, user_socials, ...rest } = obj;
      let hashed_password: string | undefined = undefined;
      if (user_password != undefined) {
        hashed_password = hashSync(user_password, 10);
      }

      if (user_email != undefined) {
        const same_email = await serv.findUserByEmail(user_email);
        if (same_email && same_email.user_id !== user_id) {
          throw new ClientError("Sudah ada pengguna dengan email yang sama !");
        }
      }

      if (user_name != undefined) {
        const same_name = await serv.user_repo.findUserByName(user_name);
        if (same_name && same_name.user_id !== user_id) {
          throw new ClientError("Sudah ada pengguna dengan nama yang sama!");
        }
      }

      if (user_socials != undefined && user_socials.length !== 0) {
        if (new Set(user_socials).size !== user_socials?.length) {
          throw new ClientError("Tidak boleh ada akun sosial media yang terduplikat!");
        }
      }

      return await serv.user_repo.updateAccountDetails(user_id, {
        ...rest,
        user_email,
        user_name,
        user_socials,
        hashed_password: hashed_password,
      });
    });
  }
}
