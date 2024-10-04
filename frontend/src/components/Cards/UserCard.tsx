import { ReactNode } from "react";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";
import BaseCard from "./BaseCard.tsx";

function UserCard(props: { user_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { user_id, sidebar, subtitle } = props;
  const { data: user_data } = useUsersDetailGet({ user_id });

  if (user_data == undefined) {
    return <BaseCard isLoading={user_data == undefined} />;
  } else {
    return (
      <BaseCard
        isLoading={false}
        image={user_data.user_image ?? undefined}
        link={`/users/${user_id}`}
        sidebar={sidebar}
        subtitle={subtitle}
        title={user_data.user_name}
      />
    );
  }
}

export default UserCard;
