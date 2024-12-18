import { Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { Redirect, useLocation, useParams } from "wouter";
import RichViewer from "../../components/RichViewer";
import StyledLink from "../../components/StyledLink.tsx";
import UserLabel from "../../components/UserLabel.tsx";
import { useArticlesDetailDelete, useArticlesDetailGet } from "../../queries/article_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks";
import AuthorizeArticle from "./AuthorizeArticle.tsx";
import ArticleCommentSection from "./components/ArticleCommentSection";
import ArticleLikeSection from "./components/ArticleLikeSection.tsx";

function ArticlesDetail(props: { article_id: number }) {
  const { article_id } = props;

  const { data: article } = useArticlesDetailGet({
    article_id,
  });

  const { data: session_data } = useSessionGet();

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

  let authorized = false;
  if (session_data?.logged) {
    authorized = session_data.user_id === article.user_id || session_data.is_admin;
  }

  return (
    <Box sx={{ paddingX: 4, maxWidth: "800px", margin: "0 auto" }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          {article.name}
        </Typography>
        <Stack direction={"row"} alignItems={"center"}>
          <Box flexGrow={1}>
            <Stack direction="row" gap={2}>
              <UserLabel user_id={article.user_id} disableName />
              <Box>
                <UserLabel user_id={article.user_id} disableImage />
                <Typography variant="caption" color="textDisabled">
                  {dayjs(article.created_at).format("ddd, DD/MM/YY")}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <ArticleLikeSection article_id={article_id} />
        </Stack>
        {authorized && (
          <Stack direction="row" gap={2}>
            <StyledLink to={`/articles/${article_id}/edit`}>
              <Button variant="contained" color="primary">
                Edit Artikel
              </Button>
            </StyledLink>
            <Button variant="contained" color="error" onClick={() => deleteArticle()}>
              Hapus Artikel
            </Button>
          </Stack>
        )}
        <Divider />
        <Box sx={{ paddingY: 2 }}>
          <RichViewer>{article.content ?? ""}</RichViewer>
        </Box>
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

  return (
    <AuthorizeArticle>
      <ArticlesDetail article_id={article_id} />
    </AuthorizeArticle>
  );
}

export default ArticlesDetailPage;
