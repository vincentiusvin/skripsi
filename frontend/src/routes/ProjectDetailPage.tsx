import { ArrowBack, Edit } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../helpers/fetch";
import { useProjectDetail } from "../queries/project_hooks";

function ProjectDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }

  const { data } = useProjectDetail(id!, (failureCount, error) => {
    if (error instanceof APIError || failureCount > 3) {
      setLocation("/projects");
      return false;
    }
    return true;
  });

  if (data) {
    return (
      <Grid container mt={2}>
        <Grid item xs={1}>
          <Link to={"/projects"}>
            <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
              Go Back
            </Button>
          </Link>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="h4" fontWeight={"bold"} align="center">
            {data.project_name}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Button endIcon={<Edit />} variant="contained" fullWidth>
            Edit
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography>{data.project_desc}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{data.org_id}</Typography>
        </Grid>
      </Grid>
    );
  } else {
    return <></>;
  }
}

export default ProjectDetailPage;
