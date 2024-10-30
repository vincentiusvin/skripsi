import { Home, Phone } from "@mui/icons-material";
import { Avatar, Box, Chip, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useOrgDetailGet } from "../../../queries/org_hooks.ts";

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
          variant="rounded"
        >
          {data.org_image}
        </Avatar>
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
              <Chip label={category.category_name} key={category.category_id} />
            ))}
          </Stack>
          <Stack direction={"row"} spacing={4}>
            <Stack direction="row" alignItems={"center"} spacing={2}>
              <Home />
              <Box>
                <Typography fontWeight="bold">Alamat</Typography>
                <Typography>{data.org_address}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems={"center"} spacing={2}>
              <Phone />
              <Box>
                <Typography fontWeight="bold">Telepon</Typography>
                <Typography>{data.org_phone}</Typography>
              </Box>
            </Stack>
          </Stack>
          <Box></Box>
        </Stack>
      </Grid>
    </Grid>
  );
}
export default OrgsInfo;
