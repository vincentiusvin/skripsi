import { ReadablePreference } from "../preferences/PreferenceRepository.js";

export const notification_types = [
  "Organisasi",
  "Proyek",
  "Tugas",
  "Diskusi Proyek",
  "Diskusi Pribadi",
  "Laporan",
  "Teman",
  "Kontribusi",
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
    Proyek: "project_notif",
    Organisasi: "org_notif",
    "Diskusi Pribadi": "msg_notif",
    "Diskusi Proyek": "msg_notif",
    Tugas: "task_notif",
    Kontribusi: "contrib_notif",
    Laporan: "report_notif",
    Teman: "friend_notif",
  } as {
    [n in NotificationTypes]: keyof ReadablePreference;
  };

  return map[notification_type];
}
