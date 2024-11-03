import { Skeleton } from "@mui/material";
import UserSelect from "../../../components/UserSelect.tsx";
import { useProjectsDetailGet } from "../../../queries/project_hooks.ts";

function ContributionSelectPeople(props: {
  value: number[];
  setValue: (x: number[]) => void;
  project_id: number;
}) {
  const { project_id, value, setValue } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (project == undefined) {
    return <Skeleton />;
  }

  return (
    <UserSelect
      label="Kontributor"
      required
      allowed_users={project.project_members
        .filter((x) => x.role === "Dev" || x.role === "Admin")
        .map((x) => x.user_id)}
      onChange={(x) => {
        setValue(x);
      }}
      current_users={value}
    />
  );
}

export default ContributionSelectPeople;
