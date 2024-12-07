import { Avatar, Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import RichViewer from "../../components/RichViewer";
import {
  useArticlesDetailCommentGet,
  useArticlesDetailDelete,
  useArticlesDetailGet,
} from "../../queries/article_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks";
import ArticleCommentSection from "./components/ArticleCommentSection";

function ArticlesDetail(props: { article_id: number }) {
  const { article_id } = props;

  // Fetch article details
  const { data, isLoading, isError } = useArticlesDetailGet({
    article_id,
  });

  // Fetch session details
  const { data: session_data } = useSessionGet();
  const user_id = session_data?.logged ? session_data.user_id : undefined;

  // Fetch comments
  const { data: comments } = useArticlesDetailCommentGet({
    article_id,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteArticleMutation = useArticlesDetailDelete({
    article_id,
    onSuccess: () => {
      setIsDeleting(false);
      setLocation("/articles"); // Redirect to articles page after deletion
    },
  });

  // Handle deletion of the article
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      setIsDeleting(true);
      deleteArticleMutation.mutate(); // Trigger delete mutation
    }
  };

  // Navigation hook
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <Skeleton />;
  }

  if (isError || !data) {
    return <Typography>Error: Article not found.</Typography>;
  }

  // Function to handle edit navigation
  const handleEdit = () => {
    setLocation(`/articles/${article_id}/edit`);
  };

  return (
    <Stack spacing={3}>
      {/* Article Title */}
      <Typography variant="h4" fontWeight="light" textAlign="center">
        {data.articles_name}
      </Typography>

      {/* Article Image */}
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

      {/* Divider */}
      <Divider />

      {/* Article Content */}
      <Box sx={{ padding: 2 }}>
        <RichViewer>{data.articles_content ?? ""}</RichViewer>
      </Box>

      {/* Buttons for Editing/Deleting */}
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

      {/* Comment Section */}
      <Box sx={{ padding: 2, marginTop: 4 }}>
        {/* <ArticleCommentSection article_id={article_id} /> */}
      </Box>
    </Stack>
  );
}

function ArticlesDetailPage() {
  const { article_id: id } = useParams();
  const article_id = Number(id);

  if (isNaN(article_id)) {
    return <Typography>Error: Invalid article ID.</Typography>;
  }

  return <ArticlesDetail article_id={article_id} />;
}

export default ArticlesDetailPage;
