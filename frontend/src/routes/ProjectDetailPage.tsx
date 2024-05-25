import { ArrowBack, Edit } from "@mui/icons-material";
import { Button, Chip, Grid, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import { APIContext, APIError } from "../helpers/fetch";

function ProjectDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data } = useQuery({
    queryKey: ["projects", "detail"],
    queryFn: () => new APIContext("getProjectsDetail").fetch(`/api/projects/${id}`),
    retry: (failureCount, error) => {
      if (error instanceof APIError || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
    },
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
        <Grid item xs={12}>
          <Typography>Categories</Typography>
          <Grid container spacing={1}>
            {data.project_categories.map((category, index) => (
              <Grid item key={index}>
                <Chip label={category} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    );
  } else {
    return <></>;
  }
}

export default ProjectDetailPage;
