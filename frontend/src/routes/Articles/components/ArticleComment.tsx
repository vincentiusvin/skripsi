import { Check, Close, Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import StyledLink from "../../../components/StyledLink.tsx";
import UserLabel from "../../../components/UserLabel.tsx";
import {
  useArticlesDetailCommentDelete,
  useArticlesDetailCommentPut,
} from "../../../queries/article_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";

type Comment = {
  user_id: number;
  id: number;
  created_at: Date;
  article_id: number;
  comment: string;
};

function ArticleComment(props: Comment) {
  const comment = props;

  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState<string | undefined>();

  const { mutate: deleteComment } = useArticlesDetailCommentDelete({
    comment_id: comment.id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil menghapus komentar!</Typography>,
        variant: "success",
      });
    },
  });

  const { mutate: editComment } = useArticlesDetailCommentPut({
    comment_id: comment.id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil mengubah komentar!</Typography>,
        variant: "success",
      });
      setIsEditing(false);
      setNewComment(undefined);
    },
  });

  const { data: session } = useSessionGet();
  let authorized = false;
  if (session?.logged) {
    authorized = session.user_id === comment.user_id || session.is_admin;
  }

  return (
    <Paper
      sx={{
        padding: 2,
      }}
    >
      <Stack direction={"row"} gap={1} alignItems={"center"} flexWrap={"wrap"}>
        <StyledLink to={`/users/${comment.user_id}`}>
          <UserLabel user_id={comment.user_id} size="small"></UserLabel>
        </StyledLink>
        <Box flexGrow={1} />
        {isEditing ? (
          <>
            <IconButton
              onClick={() => {
                editComment({
                  comment: newComment,
                });
              }}
            >
              <Check />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsEditing(false);
              }}
            >
              <Close />
            </IconButton>
          </>
        ) : authorized ? (
          <>
            <IconButton
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => {
                deleteComment();
              }}
            >
              <Delete />
            </IconButton>
          </>
        ) : null}
        <Typography variant="caption" textAlign={"end"}>
          {dayjs(comment.created_at).format("ddd, DD/MM/YY HH:mm")}
        </Typography>
      </Stack>
      <br />
      {isEditing ? (
        <TextField
          value={newComment ?? comment.comment}
          minRows={3}
          multiline
          onChange={(e) => {
            setNewComment(e.target.value);
          }}
        />
      ) : (
        <Typography whiteSpace={"pre-wrap"}>{comment.comment}</Typography>
      )}
    </Paper>
  );
}

export default ArticleComment;
