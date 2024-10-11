const notification_types = [
  "OrgManage",
  "ProjectManage",
  "ProjectTask",
  "ProjectChat",
  "GeneralChat",
  "ReportUpdate",
  "Friend",
] as const;
export type NotificationTypes = (typeof notification_types)[number];

export function parseNotificationType(type: string): NotificationTypes {
  const ret = notification_types.find((x) => x === type);
  if (ret == undefined) {
    throw new Error(`Terdapat tipe notifikasi yang invalid: ${type}`);
  }
  return ret;
}
