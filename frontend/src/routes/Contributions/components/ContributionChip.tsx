import { Chip } from "@mui/material";

function ContributionChip(props: { status: "Pending" | "Approved" | "Rejected" | "Revision" }) {
  const { status } = props;

  if (status === "Pending" || status === "Revision") {
    return <Chip color="warning" label={status} />;
  } else if (status === "Rejected") {
    return <Chip color="error" label={status} />;
  } else if (status === "Approved") {
    return <Chip color="success" label={status} />;
  }
}

export default ContributionChip;
