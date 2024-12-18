import { Button, Divider, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import StyledLink from "../../../components/StyledLink.tsx";
import UserLabel from "../../../components/UserLabel.tsx";
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

  const { mutate: addComment } = useArticlesDetailCommentPost({
    article_id,
    onSuccess: () => {
      setNewComment("");
    },
  });

  const handlePostComment = () => {
    addComment({
      comment: newComment,
    });
    setNewComment("");
  };

  if (comments == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="medium">
        Komentar{comments.length ? ` (${comments.length})` : ""}
      </Typography>
      <Divider />
      {user_id ? (
        <Stack spacing={2}>
          <TextField
            label="Komentar"
            onChange={(e) => {
              setNewComment(e.target.value);
            }}
            value={newComment}
            minRows={3}
            multiline
          />
          <Button variant="contained" onClick={handlePostComment}>
            Tambah Komentar
          </Button>
        </Stack>
      ) : (
        <Typography color="error">Anda harus login untuk menambahkan komentar.</Typography>
      )}
      <Stack sx={{ maxHeight: "300px", overflowY: "auto" }} spacing={2}>
        {comments.map((comment, index) => (
          <Paper
            key={index}
            sx={{
              padding: 2,
            }}
          >
            <Stack direction={"row"} gap={4} alignItems={"center"}>
              <StyledLink to={`/users/${comment.user_id}`}>
                <UserLabel user_id={comment.user_id} size="small"></UserLabel>
              </StyledLink>
              <Typography variant="caption" flexGrow={1} textAlign={"end"}>
                {dayjs(comment.created_at).format("ddd, DD/MM/YY HH:mm")}
              </Typography>
            </Stack>
            <br />
            <Typography whiteSpace={"pre-wrap"}>{comment.comment}</Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}

export default ArticleCommentSection;
