import { ReactNode } from "react";
import { useOrgDetailGet } from "../../queries/org_hooks.ts";
import BaseCard from "./BaseCard.tsx";

function OrgCard(props: { org_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { org_id, sidebar, subtitle } = props;
  const { data: org_data } = useOrgDetailGet({ id: org_id });

  if (org_data == undefined) {
    return <BaseCard isLoading={org_data == undefined} />;
  } else {
    return (
      <BaseCard
        isLoading={false}
        image={org_data.org_image ?? undefined}
        link={`/orgs/${org_data.org_id}`}
        sidebar={sidebar}
        subtitle={subtitle}
        title={org_data.org_name}
      ></BaseCard>
    );
  }
}

export default OrgCard;
