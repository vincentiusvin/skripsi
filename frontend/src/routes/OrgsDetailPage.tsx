import { ArrowBack, Edit } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Grid,
  List,
  ListItem,
  Typography,
} from "@mui/material";
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
        {data.org_image && (
          <Grid item xs={12}>
            <Avatar
              src={data.org_image}
              variant="rounded"
              sx={{ height: "250px", width: "250px", margin: "auto" }}
            ></Avatar>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography>{data.org_description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{data.org_address}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{data.org_phone}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>Members</Typography>
          <List>
            {data.org_users.map((x) => (
              <ListItem>{x.name}</ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    );
  } else {
    return <></>;
  }
}

export default OrgsDetailPage;
