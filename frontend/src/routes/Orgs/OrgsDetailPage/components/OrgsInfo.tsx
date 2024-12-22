import { Phone, Place } from "@mui/icons-material";
import { Avatar, Box, Chip, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import StringLabel from "../../../../components/StringLabel.tsx";
import { useOrgDetailGet } from "../../../../queries/org_hooks.ts";

function OrgsInfo(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });

  if (!data) {
    return <Skeleton />;
  }

  return (
    <Grid container alignItems={"center"}>
      <Grid
        size={{
          xs: 12,
          md: 2,
        }}
      >
        <Avatar
          sx={{
            height: 128,
            width: 128,
          }}
          src={data.org_image ?? ""}
          variant="rounded"
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 10,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={"bold"}>
            {data.org_name}
          </Typography>
          <Stack spacing={1} direction={"row"} gap={2} flexWrap={"wrap"}>
            {data.org_categories.map((category) => (
              <Chip color="secondary" label={category.category_name} key={category.category_id} />
            ))}
          </Stack>
          <Stack direction={"row"} columnGap={4} rowGap={2} flexWrap={"wrap"}>
            <StringLabel icon={<Place />} label="Lokasi" value={data.org_address} />
            <StringLabel icon={<Phone />} label="Telepon" value={data.org_phone} />
          </Stack>
          <Box></Box>
        </Stack>
      </Grid>
    </Grid>
  );
}
export default OrgsInfo;
