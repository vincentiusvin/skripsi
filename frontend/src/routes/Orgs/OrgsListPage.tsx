import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "wouter";
import { useOrgsGet } from "../../queries/org_hooks";

function OrgsListPage() {
  const { data } = useOrgsGet();
  return (
    <Box mt={4}>
      <Link to={"/orgs/add"}>
        <Button startIcon={<Add />} variant="contained" fullWidth>
          Add Organization
        </Button>
      </Link>
      <Grid container spacing={2} mt={2}>
        {data?.map((x) => (
          <Grid item xs={12} sm={6} md={3} key={x.org_id}>
            <Link to={`/orgs/${x.org_id}`}>
              <Card variant="elevation">
                <CardActionArea>
                  {x.org_image && <CardMedia component="img" height={300} src={x.org_image} />}
                  <CardContent>
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                      <Box>
                        <Typography variant="h5" fontWeight={"bold"}>
                          {x.org_name}
                        </Typography>
                        <Typography>{x.org_description}</Typography>
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

export default OrgsListPage;
