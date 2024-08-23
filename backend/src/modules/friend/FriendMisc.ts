export type FriendStatus = "Accepted" | "Pending" | "Sent" | "None";

type NeededData = {
  from_user_id: number;
  to_user_id: number;
  status: string;
};

/**
 * Map representasi DB ke bagaimana anchor_user melihatnya.
 * Accepted bakal dilihat secara sama oleh kedua orang.
 * Pending bakal dilihat sebagai "Sent" oleh pengirim dan "Pending" oleh penerima.
 * Disimpen di DB tetap sebagai "Pending".
 */
export function transfromFriendData<T extends NeededData>(data: T, anchor_user_id: number) {
  const { from_user_id, to_user_id, status, ...rest } = data;

  let sent_by_us: boolean;
  let is_pending: boolean;

  if (from_user_id === anchor_user_id) {
    sent_by_us = true;
  } else if (to_user_id === anchor_user_id) {
    sent_by_us = false;
  } else {
    throw new Error("Data friend diproses oleh user yang tidak terlibat!");
  }

  if (status === "Pending") {
    is_pending = true;
  } else if (status === "Accepted") {
    is_pending = false;
  } else {
    throw new Error("Status friend invalid!");
  }

  let new_status: FriendStatus;
  if (!is_pending) {
    new_status = "Accepted";
  } else {
    if (sent_by_us) {
      new_status = "Sent";
    } else {
      new_status = "Pending";
    }
  }

  return {
    ...rest,
    user_id: sent_by_us ? to_user_id : from_user_id,
    status: new_status,
  };
}
