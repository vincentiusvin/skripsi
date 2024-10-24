import { ReadablePreference } from "../preferences/PreferenceRepository.js";

const notification_types = [
  "OrgManage",
  "ProjectManage",
  "ProjectTask",
  "ProjectChat",
  "GeneralChat",
  "ReportUpdate",
  "Friend",
  "ContributionUpdate",
] as const;
export type NotificationTypes = (typeof notification_types)[number];

export function parseNotificationType(type: string): NotificationTypes {
  const ret = notification_types.find((x) => x === type);
  if (ret == undefined) {
    throw new Error(`Terdapat tipe notifikasi yang invalid: ${type}`);
  }
  return ret;
}

export function getPreferenceKeyFromNotificationType(notification_type: NotificationTypes) {
  const map = {
    ProjectManage: "project_notif",
    OrgManage: "org_notif",
    GeneralChat: "msg_notif",
    ProjectChat: "msg_notif",
    ReportUpdate: "report_notif",
    ProjectTask: "task_notif",
    Friend: "friend_notif",
  } as Record<NotificationTypes[number], keyof ReadablePreference>;

  return map[notification_type];
}
