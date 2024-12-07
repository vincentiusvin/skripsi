import { Avatar, Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
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
    <Stack spacing={3}>
      <Typography variant="h3" fontWeight="bold" textAlign="center">
        {article.name}
      </Typography>
      <Divider />
      <ArticleLikeSection article_id={article_id} />
      <Divider />
      <Box sx={{ textAlign: "center" }}>
        <Avatar
          sx={{
            height: 128,
            width: 128,
            margin: "auto",
          }}
          src={article.image ?? ""}
          variant="rounded"
        />
      </Box>

      <Box sx={{ padding: 2 }}>
        <RichViewer>{article.content ?? ""}</RichViewer>
      </Box>

      {user_id === article.user_id && (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <StyledLink to={`/articles/${article_id}/edit`}>
            <Button variant="contained" color="primary">
              Edit Artikel
            </Button>
          </StyledLink>
          <Button variant="contained" color="error" onClick={() => deleteArticle()}>
            Hapus Artikel
          </Button>
        </Box>
      )}

      <Box sx={{ padding: 2, marginTop: 4 }}>
        <ArticleCommentSection article_id={article_id} />
      </Box>
    </Stack>
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
