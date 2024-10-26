import { Add } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import charityImg from "../../assets/charity.png";
import StyledLink from "../../components/StyledLink.tsx";
import { useOrgsGet } from "../../queries/org_hooks";

function OrgsListPage() {
  const { data } = useOrgsGet();
  return (
    <Box>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"} marginBottom={2}>
        Daftar Organisasi
      </Typography>
      <Paper
        sx={{
          padding: 4,
        }}
      >
        <Grid
          container
          alignItems={"center"}
          spacing={{
            md: 16,
          }}
          paddingX={{ md: 8 }}
        >
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Typography marginBottom={4}>
              Anda dapat mencari organisasi yang terdaftar di sini.
            </Typography>
            <Typography marginBottom={2}>
              Apabila anda merupakan pengurus organisasi nirlaba yang membutuhkan bantuan teknologi,
              anda juga dapat mendaftarkan organisasi anda disini.
            </Typography>
            <StyledLink to={"/orgs/add"}>
              <Button startIcon={<Add />} variant="contained">
                Daftarkan Organisasi
              </Button>
            </StyledLink>
          </Grid>
          <Grid size={{ md: 4, xs: 0 }} display={{ md: "block", xs: "none" }}>
            <Avatar
              sx={{
                width: "100%",
                height: "100%",
              }}
              variant="square"
              src={charityImg}
            ></Avatar>
          </Grid>
        </Grid>
      </Paper>
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
