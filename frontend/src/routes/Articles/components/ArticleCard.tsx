import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useArticlesDetailGet } from "../../../queries/article_hooks";

function ArticleCard(props: { article_id: number }) {
  const { article_id } = props;
  const { data: article_data } = useArticlesDetailGet({ article_id: article_id });

  if (article_data == undefined) {
    return <Skeleton />;
  }

  return (
    <Card>
      <CardActionArea>
        <CardContent>
          <Stack direction="row" alignItems={"center"} gap={2}>
            <Avatar variant="rounded" src={article_data.image ?? ""} />
            <Stack direction="column">
              <Typography variant="h6">{article_data.name}</Typography>
              <Stack direction="row" rowGap={1} columnGap={2} flexWrap={"wrap"}>
                <Stack direction="row" alignItems={"center"} gap={0.5}>
                  <Typography>{article_data.description}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ArticleCard;
