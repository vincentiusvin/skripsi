import { Add, SearchOutlined } from "@mui/icons-material";
import { Avatar, Button, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useDebounce } from "use-debounce";
import QueryPagination from "../../components/QueryPagination";
import useQueryPagination from "../../components/QueryPagination/hook";
import StyledLink from "../../components/StyledLink";
import { useStateSearch } from "../../helpers/search";
import { useArticlesGet } from "../../queries/article_hooks";
import ArticleCard from "./components/ArticleCard";

function ArticlesListPage() {
  const [keyword, setKeyword] = useStateSearch("keyword");
  const [debouncedKeyword] = useDebounce(keyword, 250);

  const [page, setPage] = useQueryPagination();
  const limit = 10;
  const { data: articles_raw } = useArticlesGet({
    keyword: debouncedKeyword?.toString(),
    limit,
    page,
  });
  const articles = articles_raw?.result;

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Artikel
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
            <Typography marginBottom={4}>Anda dapat mencari artikel di halaman ini.</Typography>
            <Typography marginBottom={2}>
              Anda juga dapat menambahkan artikel baru dan mengeditnya dihalaman ini.
            </Typography>
            <StyledLink to={"/articles/add"}>
              <Button startIcon={<Add />} variant="contained">
                Tambahkan Artikel
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
              // src={charityImg}
            ></Avatar>
          </Grid>
        </Grid>
      </Paper>
      <Stack direction="row" alignItems={"center"}>
        <Typography flexGrow={1} variant="h6">
          Daftar Artikel
        </Typography>
        <TextField
          label={"Cari artikel"}
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
            setPage(1);
          }}
        />
      </Stack>
      <Grid container spacing={2} mt={2}>
        {articles?.map((article) => (
          <Grid
            key={article.article_id}
            size={{
              xs: 12,
            }}
          >
            <StyledLink to={`/articles/${article.article_id}`}>
              <ArticleCard article_id={article.article_id} />
            </StyledLink>
          </Grid>
        ))}
      </Grid>
      <QueryPagination total={articles_raw?.total} limit={limit} />
    </Stack>
  );
}

export default ArticlesListPage;
