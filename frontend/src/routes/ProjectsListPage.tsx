import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { APIContext } from "../helpers/fetch";

function ProjectListPage() {
  const { data } = useQuery({
    queryKey: ["projects", "collection"],
    queryFn: () => new APIContext("getProjects").fetch("/api/projects"),
  });

  return (
    <Box mt={4}>
      <Link to={"/projects/add"}>
        <Button startIcon={<Add />} variant="contained" fullWidth>
          Add Projects
        </Button>
      </Link>
      <Grid container spacing={2} mt={2}>
        {data?.map((x, i) => (
          <Grid item xs={3} key={i}>
            <Link to={`/projects/${x.project_id}`}>
              <Card variant="elevation">
                <CardActionArea>
                  <CardContent>
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                      <Box>
                        <Typography variant="h5" fontWeight={"bold"}>
                          {x.project_name}
                        </Typography>
                        <Typography>{x.org_id}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ProjectListPage;
