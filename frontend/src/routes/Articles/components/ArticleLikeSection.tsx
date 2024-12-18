import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { Box, IconButton, Skeleton, Typography } from "@mui/material";
import {
  useArticleLike,
  useArticleLikeStatusGet,
  useArticleUnlike,
  useArticlesLikesGet,
} from "../../../queries/article_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";

function ArticleLikeFunctional(props: { article_id: number; user_id: number }) {
  const { article_id, user_id } = props;
  const { data: like_status } = useArticleLikeStatusGet({ article_id, user_id });
  const { mutate: unlike } = useArticleUnlike({ article_id, user_id });
  const { mutate: like } = useArticleLike({ article_id, user_id });

  if (like_status == undefined) {
    return <Skeleton />;
  }

  if (like_status.like) {
    return (
      <IconButton onClick={() => unlike()} color={"default"}>
        <ThumbUpIcon />
      </IconButton>
    );
  } else {
    return (
      <IconButton onClick={() => like()} color={"primary"}>
        <ThumbUpOffAltIcon />
      </IconButton>
    );
  }
}

function ArticleLikeDecorative() {
  return (
    <IconButton color={"default"} disabled>
      <ThumbUpOffAltIcon />
    </IconButton>
  );
}

function ArticleLikeSection(props: { article_id: number }) {
  const { article_id } = props;
  const { data: session } = useSessionGet();
  const { data: likes } = useArticlesLikesGet({ article_id });

  if (likes == undefined) {
    return <Skeleton />;
  }

  return (
    <Box textAlign={"center"}>
      {session?.logged ? (
        <ArticleLikeFunctional article_id={article_id} user_id={session.user_id} />
      ) : (
        <ArticleLikeDecorative />
      )}
      <Typography variant="body2" flexGrow={1}>
        Disukai oleh {likes.likes} orang
      </Typography>
    </Box>
  );
}

export default ArticleLikeSection;
