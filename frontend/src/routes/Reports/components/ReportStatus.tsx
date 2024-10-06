import { Chip } from "@mui/material";

function ReportStatusChip(props: { status: "Pending" | "Resolved" | "Rejected" }) {
  const { status } = props;
  if (status === "Pending") {
    return <Chip color="warning" label="Menunggu" />;
  } else if (status === "Resolved") {
    return <Chip color="success" label="Diterima" />;
  } else if (status === "Rejected") {
    return <Chip color="error" label="Ditolak" />;
  }
}

export default ReportStatusChip;
