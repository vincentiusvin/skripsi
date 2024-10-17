export const contribution_status = ["Accepted", "Pending", "Revision"] as const;
export type ContributionStatus = (typeof contribution_status)[number];

export function parseContribStatus(status: string): ContributionStatus {
  const ret = contribution_status.find((x) => x === status);
  if (ret == undefined) {
    throw new Error(`Terdapat status kontribusi yang invalid: ${status}`);
  }
  return ret;
}
