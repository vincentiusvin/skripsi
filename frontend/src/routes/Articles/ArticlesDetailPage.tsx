import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import RichViewer from "../../components/RichViewer";
import {
  useArticlesDetailDelete,
  useArticlesDetailGet,
  useArticlesLikesGet,
  useArticlesUpvoteAdd,
  useArticlesUpvoteDelete,
} from "../../queries/article_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks";
import ArticleCommentSection from "./components/ArticleCommentSection";
function ArticlesDetail(props: { article_id: number }) {
  const { article_id } = props;

  const { data, isLoading, isError } = useArticlesDetailGet({
    article_id,
  });
  const { data: session_data } = useSessionGet();
  const user_id = session_data?.logged ? session_data.user_id : undefined;
  const [isDeleting, setIsDeleting] = useState(false);
  //User article like biar ga lupa ni
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { data: likesData } = useArticlesLikesGet({ article_id });

  const upvoteAddMutation = useArticlesUpvoteAdd({
    onSuccess: () => {
      setLikesCount((prev) => prev + 1);
      setLiked(true);
    },
  });

  const upvoteDeleteMutation = useArticlesUpvoteDelete({
    onSuccess: () => {
      setLikesCount((prev) => Math.max(prev - 1, 0));
      setLiked(false);
    },
  });

  useEffect(() => {
    if (Array.isArray(likesData)) {
      setLikesCount(likesData.length);
      setLiked(likesData.some((like) => like.user_id === user_id));
    }
  }, [likesData, user_id]);

  const deleteArticleMutation = useArticlesDetailDelete({
    article_id,
    onSuccess: () => {
      setIsDeleting(false);
      setLocation("/articles");
    },
  });

  const handleLikeToggle = () => {
    if (!user_id) {
      <Typography>Error: User not logged in!</Typography>;
    } else {
      if (liked) {
        upvoteDeleteMutation.mutate();
      } else {
        upvoteAddMutation.mutate({ article_id, user_id });
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      setIsDeleting(true);
      deleteArticleMutation.mutate();
    }
  };

  const [, setLocation] = useLocation();

  if (isLoading) {
    return <Skeleton />;
  }

  if (isError || !data) {
    return <Typography>Artilkel tidak ditemukan</Typography>;
  }

  const handleEdit = () => {
    setLocation(`/articles/${article_id}/edit`);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h3" fontWeight="bold" textAlign="center">
        {data.articles_name}
      </Typography>
      <Divider />
      <Box sx={{ textAlign: "center" }}>
        <IconButton onClick={handleLikeToggle} color={liked ? "primary" : "default"}>
          {liked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
        </IconButton>
        <Typography variant="body2">{likesCount} Likes</Typography>
      </Box>

      <Divider />

      <Box sx={{ textAlign: "center" }}>
        <Avatar
          sx={{
            height: 128,
            width: 128,
            margin: "auto",
          }}
          src={data.articles_image ?? ""}
          variant="rounded"
        />
      </Box>

      <Box sx={{ padding: 2 }}>
        <RichViewer>{data.articles_content ?? ""}</RichViewer>
      </Box>
      {user_id === data.user_id && (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit Article
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Article"}
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
    return <Typography>Error: Artikel ID tidak valid.</Typography>;
  }

  return <ArticlesDetail article_id={article_id} />;
}

export default ArticlesDetailPage;
