import { Chip } from "@mui/material";

function ContributionChip(props: { status: "Pending" | "Approved" | "Rejected" | "Revision" }) {
  const { status } = props;

  if (status === "Pending") {
    return <Chip color="warning" label={"Menunggu"} />;
  } else if (status === "Revision") {
    return <Chip color="warning" label={"Revisi"} />;
  } else if (status === "Rejected") {
    return <Chip color="error" label={"Ditolak"} />;
  } else if (status === "Approved") {
    return <Chip color="success" label={"Diterima"} />;
  }
}

export default ContributionChip;
