import { Phone, Place } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useOrgDetailGet } from "../../queries/org_hooks.ts";

function OrgCard(props: { org_id: number }) {
  const { org_id } = props;
  const { data: org_data } = useOrgDetailGet({ id: org_id });

  if (org_data == undefined) {
    return <Skeleton></Skeleton>;
  }

  return (
    <Card>
      <CardActionArea>
        <CardContent>
          <Stack direction="row" alignItems={"center"} gap={2}>
            <Avatar variant="rounded" src={org_data.org_image ?? ""} />
            <Stack direction="column">
              <Typography variant="h6">{org_data.org_name}</Typography>
              <Stack direction="row" rowGap={1} columnGap={2} flexWrap={"wrap"}>
                <Stack direction="row" alignItems={"center"} gap={0.5}>
                  <Place />
                  <Typography>{org_data.org_address}</Typography>
                </Stack>
                <Stack direction="row" alignItems={"center"} gap={0.5}>
                  <Phone />
                  <Typography>{org_data.org_phone}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" gap={2} mt={1} flexWrap={"wrap"}>
            {org_data.org_categories.map((x) => (
              <Chip color="secondary" label={x.category_name} key={x.category_id} />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default OrgCard;
