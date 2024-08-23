import { Grid, Paper, Skeleton } from "@mui/material";
import { Link } from "wouter";
import UserCard from "../../../components/UserCard.tsx";
import { useFriendsGet } from "../../../queries/friend_hooks.ts";

function UserFriendList(props: { user_id: number }) {
  const { user_id } = props;
  const { data: friends } = useFriendsGet({ user_id });

  if (!friends) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={4}>
      {friends
        .filter((x) => x.status === "Accepted")
        .map((x) => (
          <Grid item xs={4} key={x.user_id}>
            <Link to={`/users/${x.user_id}`}>
              <Paper>
                <UserCard user_id={user_id} />
              </Paper>
            </Link>
          </Grid>
        ))}
    </Grid>
  );
}

export default UserFriendList;
