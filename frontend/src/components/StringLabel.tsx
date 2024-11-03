import { Link, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

function StringLabel(props: { link?: string; icon: ReactNode; label: string; value?: string }) {
  const { icon, label, value, link } = props;
  return (
    <Stack direction="row" gap={2} alignItems={"center"}>
      {icon}
      <Stack>
        <Typography variant="caption">{label}</Typography>
        {value != undefined && value.length !== 0 ? (
          link != undefined ? (
            <Link href={link}>
              <Typography variant="body1">{value}</Typography>
            </Link>
          ) : (
            <Typography variant="body1">{value}</Typography>
          )
        ) : (
          <Typography color="gray">Belum diisi</Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default StringLabel;
