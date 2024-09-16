import { Avatar, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ReactNode } from "react";
import { Link } from "wouter";
import { useOrgDetailGet } from "../queries/org_hooks.ts";

function OrgCard(props: { org_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { org_id, sidebar, subtitle } = props;
  const { data: org_data } = useOrgDetailGet({ id: org_id });

  if (!org_data) {
    return (
      <Grid container minWidth={280} spacing={4} alignItems={"center"}>
        <Grid size={2}>
          <Avatar src={undefined}></Avatar>
        </Grid>
        <Grid size={4}>
          <Skeleton width={"100%"}></Skeleton>
        </Grid>
      </Grid>
    );
  }

  if (sidebar) {
    return (
      <Grid container width={280} spacing={4} alignItems={"center"}>
        <Grid
          size={{
            xs: 4,
            lg: 2,
          }}
        >
          <Link to={`/orgs/${org_id}`}>
            <Avatar src={org_data.org_image ?? undefined}></Avatar>
          </Link>
        </Grid>
        <Grid
          size={{
            xs: 8,
            lg: 4,
          }}
        >
          <Stack>
            <Link to={`/orgs/${org_id}`}>
              <Typography variant="h6" color="primary">
                {org_data.org_name}
              </Typography>
            </Link>
            <Typography variant="body2" color={"primary"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <Stack spacing={2}>{sidebar}</Stack>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container width={140} spacing={4} alignItems={"center"}>
        <Grid size={4}>
          <Link to={`/orgs/${org_id}`}>
            <Avatar src={org_data.org_image ?? undefined}></Avatar>
          </Link>
        </Grid>
        <Grid size={8}>
          <Stack>
            <Link to={`/orgs/${org_id}`}>
              <Typography variant="h6" color="primary">
                {org_data.org_name}
              </Typography>
            </Link>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }
}

export default OrgCard;
