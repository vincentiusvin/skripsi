const report_status = ["Rejected", "Resolved", "Pending"] as const;
export type ReportStatus = (typeof report_status)[number];

export function parseReportStatus(role: string): ReportStatus {
  const ret = report_status.find((x) => x === role);
  if (ret == undefined) {
    throw new Error(`Terdapat status yang invalid: ${role}`);
  }
  return ret;
}
