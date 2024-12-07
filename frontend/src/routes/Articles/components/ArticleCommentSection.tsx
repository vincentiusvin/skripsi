import { Button, Divider, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import RichEditor from "../../../components/RichEditor";
import RichViewer from "../../../components/RichViewer";
import {
  useArticlesDetailCommentPost,
  useArticlesDetailCommentsGet,
} from "../../../queries/article_hooks";
import { useSessionGet } from "../../../queries/sesssion_hooks";

function ArticleCommentSection(props: { article_id: number }) {
  const { article_id } = props;
  const { data: comments } = useArticlesDetailCommentsGet({
    article_id,
  });

  const { data: session_data } = useSessionGet();
  const user_id = session_data?.logged ? session_data.user_id : undefined;

  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const { mutate: addComment } = useArticlesDetailCommentPost({
    article_id,
    onSuccess: () => {
      setNewComment("");
      setIsPosting(false);
    },
  });

  const handlePostComment = () => {
    addComment({
      comment: newComment,
    });
  };

  if (comments == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight="medium">
        Comments
      </Typography>
      <Divider />
      <Stack sx={{ maxHeight: "300px", overflowY: "auto" }} spacing={2}>
        {comments.map((comment, index) => (
          <Paper
            key={index}
            sx={{
              padding: 2,
            }}
          >
            <Typography color="text.secondary">{`User ${comment.user_id}`}</Typography>
            <RichViewer>{comment.comment}</RichViewer>
          </Paper>
        ))}
      </Stack>
      <Divider />
      {user_id ? (
        <Stack spacing={2}>
          <RichEditor label={"Komentar"} onBlur={(x) => setNewComment(x)}></RichEditor>
          <Button variant="contained" onClick={handlePostComment} disabled={isPosting}>
            Tambah Komentar
          </Button>
        </Stack>
      ) : (
        <Typography color="error">Anda harus login untuk menambahkan komentar.</Typography>
      )}
    </Stack>
  );
}

export default ArticleCommentSection;
