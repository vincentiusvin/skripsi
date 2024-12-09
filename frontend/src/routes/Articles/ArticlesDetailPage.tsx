import { Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { Redirect, useLocation, useParams } from "wouter";
import RichViewer from "../../components/RichViewer";
import StyledLink from "../../components/StyledLink.tsx";
import { useArticlesDetailDelete, useArticlesDetailGet } from "../../queries/article_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks";
import ArticleCommentSection from "./components/ArticleCommentSection";
import ArticleLikeSection from "./components/ArticleLikeSection.tsx";
function ArticlesDetail(props: { article_id: number }) {
  const { article_id } = props;

  const { data: article } = useArticlesDetailGet({
    article_id,
  });

  const { data: session_data } = useSessionGet();
  const user_id = session_data?.logged ? session_data.user_id : undefined;

  const { mutate: deleteArticle } = useArticlesDetailDelete({
    article_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Artikel berhasil dihapus!</Typography>,
        variant: "success",
      });
      setLocation("/articles");
    },
  });

  const [, setLocation] = useLocation();

  if (!article) {
    return <Skeleton />;
  }

  return (
    <Box sx={{ paddingX: 4, maxWidth: "800px", margin: "0 auto" }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          {article.name}
        </Typography>
        <Divider />
        <ArticleLikeSection article_id={article_id} />
        <Divider />
        <Box sx={{ marginY: 3 }}>
          <Box
            component="img"
            src={article.image ?? ""}
            alt="Article Banner"
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        </Box>
        <Box sx={{ paddingY: 2 }}>
          <RichViewer>{article.content ?? ""}</RichViewer>
        </Box>
        {user_id === article.user_id && (
          <Grid container spacing={2} justifyContent="center">
            <Grid>
              <StyledLink to={`/articles/${article_id}/edit`}>
                <Button variant="contained" color="primary">
                  Edit Artikel
                </Button>
              </StyledLink>
            </Grid>
            <Grid>
              <Button variant="contained" color="error" onClick={() => deleteArticle()}>
                Hapus Artikel
              </Button>
            </Grid>
          </Grid>
        )}
        <Box sx={{ paddingY: 2, marginTop: 4 }}>
          <ArticleCommentSection article_id={article_id} />
        </Box>
      </Stack>
    </Box>
  );
}

function ArticlesDetailPage() {
  const { article_id: id } = useParams();
  const article_id = Number(id);

  if (isNaN(article_id)) {
    return <Redirect to="/articles" />;
  }

  return <ArticlesDetail article_id={article_id} />;
}

export default ArticlesDetailPage;
