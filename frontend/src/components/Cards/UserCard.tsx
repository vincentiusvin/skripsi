import { ReactNode } from "react";
import avatarFallback from "../../helpers/avatar_fallback.tsx";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";
import BaseCard from "./BaseCard.tsx";

function UserCard(props: { user_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { user_id, sidebar, subtitle } = props;
  const { data: user_data } = useUsersDetailGet({ user_id });

  if (user_data == undefined) {
    return <BaseCard isLoading={user_data == undefined} />;
  } else {
    const image =
      user_data.user_image ??
      avatarFallback({
        label: user_data.user_name,
        seed: user_data.user_id,
      });
    return (
      <BaseCard
        isLoading={false}
        image={image}
        link={`/users/${user_id}`}
        sidebar={sidebar}
        subtitle={subtitle}
        title={user_data.user_name}
      />
    );
  }
}

export default UserCard;
