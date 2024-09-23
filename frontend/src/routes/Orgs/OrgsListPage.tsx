import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import StyledLink from "../../components/StyledLink.tsx";
import { useOrgsGet } from "../../queries/org_hooks";

function OrgsListPage() {
  const { data } = useOrgsGet();
  return (
    <Box>
      <StyledLink to={"/orgs/add"}>
        <Button startIcon={<Add />} variant="contained" fullWidth>
          Add Organization
        </Button>
      </StyledLink>
      <Grid container spacing={2} mt={2}>
        {data?.map((x) => (
          <Grid
            key={x.org_id}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <StyledLink to={`/orgs/${x.org_id}`}>
              <Card>
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
            </StyledLink>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default OrgsListPage;
