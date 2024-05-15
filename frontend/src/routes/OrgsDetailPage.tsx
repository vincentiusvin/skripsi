import { ArrowBack, Edit } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import useSWR from "swr";
import { Link, useLocation, useParams } from "wouter";
import { APIContext, APIError } from "../helpers/fetch";

function OrgsDetailPage() {
  const { id } = useParams();
  const { data, error } = useSWR(
    `/api/orgs/${id}`,
    new APIContext("GetOrgDetail").fetch
  );
  const [, setLocation] = useLocation();

  if (error instanceof APIError) {
    setLocation("/orgs");
  }

  if (data && !("msg" in data)) {
    return (
      <Grid container mt={2}>
        <Grid item xs={1}>
          <Link to={"/orgs"}>
            <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
              Go Back
            </Button>
          </Link>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="h4" fontWeight={"bold"} align="center">
            {data.org_name}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Button endIcon={<Edit />} variant="contained" fullWidth>
            Edit
          </Button>
        </Grid>
        <Grid item>
          <Typography>{data.org_description}</Typography>
        </Grid>
      </Grid>
    );
  } else {
    return <></>;
  }
}

export default OrgsDetailPage;
