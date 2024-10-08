import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import StyledLink from "../../../../components/StyledLink";
import { useContributionsGet } from '../../../../queries/contribution_hooks';

function ContributionsListPage() {
  const { data } = useContributionsGet();
  return (
    <Box>
      <StyledLink to={"/contributions/add"}>
        <Button startIcon={<Add />} variant="contained" fullWidth>
          Add Contribution
        </Button>
      </StyledLink>
      <Grid container spacing={2} mt={2}>
        {data?.map((x) => (
          <Grid
            key={x.id}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <StyledLink to={`/contributions/${x.id}`}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                      <Box>
                        <Typography variant="h5" fontWeight={"bold"}>
                          {x.name}
                        </Typography>
                        <Typography>{x.description}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </StyledLink>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ContributionsListPage;
