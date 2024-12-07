import { Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import RichEditor from "../../../components/RichEditor";
import RichViewer from "../../../components/RichViewer";
import {
  useArticlesDetailCommentGet,
  useArticlesDetailCommentPost,
} from "../../../queries/article_hooks";
import { useSessionGet } from "../../../queries/sesssion_hooks";

function ArticleCommentSection({ article_id }: { article_id: number }) {
  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useArticlesDetailCommentGet({
    article_id,
  });

  const { data: session_data } = useSessionGet();
  const user_id = session_data?.logged ? session_data.user_id : undefined;

  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const postCommentMutation = useArticlesDetailCommentPost({
    article_id,
    onSuccess: () => {
      setNewComment("");
      setIsPosting(false);
    },
  });

  const handlePostComment = () => {
    if (!user_id) {
      alert("You must log in before posting a comment.");
      return;
    }
    if (newComment.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }
    setIsPosting(true);
    postCommentMutation.mutate(
      {
        comment: newComment,
        user_id,
      },
      {
        onSuccess: () => {
          setNewComment(""); // Reset the RichEditor value
          setIsPosting(false);
        },
      },
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight="medium">
        Comments
      </Typography>
      <Divider />
      {/* Comments List */}
      <Box sx={{ maxHeight: "300px", overflowY: "auto", padding: 1 }}>
        {isCommentsLoading ? (
          <Skeleton />
        ) : isCommentsError || !comments ? (
          <Typography>Error loading comments.</Typography>
        ) : comments.length ? (
          comments.map((comment, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography fontSize="0.9rem" color="text.secondary">
                {`User ${comment.user_id}`}
              </Typography>
              <RichViewer>{comment.comment}</RichViewer>
            </Box>
          ))
        ) : (
          <Typography>No comments yet. Be the first to comment!</Typography>
        )}
      </Box>
      <Divider />
      {/* Comment Form */}
      {user_id ? (
        <Stack spacing={2}>
          <RichEditor
            label={"Write Your Comment Here"}
            defaultValue={newComment}
            onBlur={(x) => setNewComment(x)}
          ></RichEditor>
          <Button variant="contained" onClick={handlePostComment} disabled={isPosting}>
            {isPosting ? "Posting..." : "Post Comment"}
          </Button>
        </Stack>
      ) : (
        <Typography color="error">You need to log in to post a comment.</Typography>
      )}
    </Stack>
  );
}

export default ArticleCommentSection;
