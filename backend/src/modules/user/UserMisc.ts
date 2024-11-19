export const otp_types = ["Register", "Password"] as const;
export type OTPTypes = (typeof otp_types)[number];

export function parseOTPTypes(type: string) {
  const ret = otp_types.find((x) => x === type);
  if (ret == undefined) {
    throw new Error(`Terdapat tipe otp yang invalid: ${type}`);
  }
  return ret;
}
