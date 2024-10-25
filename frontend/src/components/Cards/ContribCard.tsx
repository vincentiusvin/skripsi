import { Box, Card, CardActionArea, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { useContributionsDetailGet } from "../../queries/contribution_hooks.ts";
import StyledLink from "../StyledLink.tsx";

function ContribCard(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { data: contrib_data } = useContributionsDetailGet({
    contribution_id,
  });

  if (contrib_data == undefined) {
    return <Skeleton />;
  }

  return (
    <StyledLink to={`/contributions/${contribution_id}`}>
      <Card>
        <CardActionArea>
          <CardContent>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={"bold"}>
                  {contrib_data.name}
                </Typography>
                <Typography>{contrib_data.description}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </StyledLink>
  );
}

export default ContribCard;
