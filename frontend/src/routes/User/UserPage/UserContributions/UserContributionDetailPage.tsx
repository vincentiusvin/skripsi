import { Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { useContributionsDetailGet } from "../../../../queries/contribution_hooks";

function ContributionDetail() {
  const { contribution_id } = useParams(); // Get the contribution ID from the URL
  const { data: contribution, isLoading } = useContributionsDetailGet({
    contribution_id: Number(contribution_id),
  });

  if (isLoading || !contribution) {
    return <Skeleton variant="rectangular" height={200} />;
  }

  return (
    <Box mt={3} p={2}>
      <Stack gap={2} alignItems="center">
        {/* Display the contribution name */}
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          {contribution.name}
        </Typography>

        {/* Display the contribution description */}
        <Typography variant="body1" textAlign="center">
          {contribution.description}
        </Typography>

        {/* Display contribution status */}
        <Chip label={contribution.status} color="primary" />

        {/* Display the list of users associated with the contribution */}
        <Typography variant="h5" fontWeight="bold">
          Contributing Users:
        </Typography>

        <Grid container spacing={2} sx={{ width: "75%" }}>
          {contribution.contribution_users.map((user, index) => (
            <Grid
              key={index}
              component="div" // Adding component="div" as Grid2 might require an explicit component
            >
              <Typography>User ID: {user.user_id}</Typography>
            </Grid>
          ))}
        </Grid>

        {/* A back button to return to the contribution list */}
        <Button
          variant="contained"
          onClick={() => window.history.back()} // Navigate back
          fullWidth
        >
          Back to Contributions
        </Button>
      </Stack>
    </Box>
  );
}

export default ContributionDetail;
