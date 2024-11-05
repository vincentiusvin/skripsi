import { Add } from "@mui/icons-material";
import { Avatar, Button, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import charityImg from "../../assets/charity.png";
import OrgCard from "../../components/Cards/OrgCard.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import { useOrgsGet } from "../../queries/org_hooks";

function OrgsListPage() {
  const { data } = useOrgsGet();
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Organisasi
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
              Anda dapat mencari organisasi yang terdaftar di website ini.
            </Typography>
            <Typography marginBottom={2}>
              Apabila anda merupakan pengurus organisasi nirlaba yang membutuhkan bantuan teknologi,
              anda juga dapat mendaftarkan organisasi anda.
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
      <Typography variant="h6">Daftar Organisasi</Typography>
      <Grid container spacing={2} mt={2}>
        {data?.map((x) => (
          <Grid
            key={x.org_id}
            size={{
              xs: 12,
            }}
          >
            <StyledLink to={`/orgs/${x.org_id}`}>
              <OrgCard org_id={x.org_id} />
            </StyledLink>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default OrgsListPage;
