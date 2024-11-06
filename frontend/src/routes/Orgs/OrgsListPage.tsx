import { Add, SearchOutlined } from "@mui/icons-material";
import { Avatar, Button, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useDebounce } from "use-debounce";
import charityImg from "../../assets/charity.png";
import OrgCard from "../../components/Cards/OrgCard.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useOrgsGet } from "../../queries/org_hooks";

function OrgsListPage() {
  const searchHook = useSearchParams();
  const [keyword, setKeyword] = useStateSearch("keyword", searchHook);
  const [debouncedKeyword] = useDebounce(keyword, 250);

  const { data } = useOrgsGet({
    keyword: debouncedKeyword?.toString(),
  });

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
      <Stack direction="row" alignItems={"center"}>
        <Typography flexGrow={1} variant="h6">
          Daftar Organisasi
        </Typography>
        <TextField
          label={"Cari organisasi"}
          value={keyword ?? ""}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            },
          }}
          onChange={(e) => {
            const keyword = e.currentTarget.value;
            if (keyword.length) {
              setKeyword(keyword);
            } else {
              setKeyword(undefined);
            }
          }}
        />
      </Stack>
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
