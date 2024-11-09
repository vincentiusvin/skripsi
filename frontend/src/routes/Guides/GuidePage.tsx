import { Box, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import { Redirect, useParams } from "wouter";
import CreateAccount from "./content/CreateAccount.tsx";
import CreateReport from "./content/CreateReport.tsx";
import DevContribs from "./content/DevContribs.tsx";
import DevProject from "./content/DevProject.tsx";
import Friend from "./content/Friend.tsx";
import OrgCreate from "./content/OrgCreate.tsx";
import OrgOrgMembers from "./content/OrgOrgMembers.tsx";
import OrgProject from "./content/OrgProject.tsx";
import OrgProjectMembers from "./content/OrgProjectMembers.tsx";
import ProjectFeatures from "./content/ProjectFeatures.tsx";
import { ContentType } from "./type.tsx";

function Guide(props: { content: ContentType }) {
  const { content } = props;
  return (
    <Box
      sx={{
        marginX: "10%",
        marginY: 4,
      }}
    >
      <Typography textAlign={"center"} mb={4} variant="h5" fontWeight={"bold"}>
        {content.title}
      </Typography>
      <Stepper orientation="vertical">
        {content.steps.map((x, i) => (
          <Step key={i} active={true}>
            <StepLabel>
              <Typography>{x.title}</Typography>
            </StepLabel>
            {x.content != null ? <StepContent>{x.content}</StepContent> : null}
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

const GuideMapper = {
  account: CreateAccount,
  report: CreateReport,
  "dev-project": DevProject,
  "dev-contribs": DevContribs,
  "project-features": ProjectFeatures,
  "org-create": OrgCreate,
  "org-project": OrgProject,
  "org-project-members": OrgProjectMembers,
  "org-org-members": OrgOrgMembers,
  friend: Friend,
};

function GuidePage() {
  const { guide } = useParams();
  if (guide == undefined || !(guide in GuideMapper)) {
    return <Redirect to="/" />;
  }

  return <Guide content={GuideMapper[guide as keyof typeof GuideMapper]} />;
}

export default GuidePage;
