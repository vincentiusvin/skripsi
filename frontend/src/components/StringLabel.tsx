import { Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

function StringLabel(props: { icon: ReactNode; label: string; value?: string }) {
  const { icon, label, value } = props;
  return (
    <Stack direction="row" gap={2} alignItems={"center"}>
      {icon}
      <Stack>
        <Typography variant="caption">{label}</Typography>
        {value != undefined && value.length !== 0 ? (
          <Typography variant="body1">{value}</Typography>
        ) : (
          <Typography color="gray">Belum diisi</Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default StringLabel;
