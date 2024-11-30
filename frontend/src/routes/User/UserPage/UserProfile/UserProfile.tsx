import { Email, Language, Place, School, Work } from "@mui/icons-material";
import { Avatar, Paper, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useLocation } from "wouter";
import StringLabel from "../../../../components/StringLabel.tsx";
import avatarFallback from "../../../../helpers/avatar_fallback.tsx";
import { APIError } from "../../../../helpers/fetch.ts";
import { LinkIcons, linkParser } from "../../../../helpers/linker.tsx";
import { useUsersDetailGet } from "../../../../queries/user_hooks.ts";
import UserProfileContribs from "./components/UserProfileContribs.tsx";
import UserFriendList from "./components/UserProfileFriend.tsx";
import FriendShortcut from "./components/UserProfileManageFriend.tsx";
import UserOrgsList from "./components/UserProfileOrgs.tsx";
import UserProjectsList from "./components/UserProfileProjects.tsx";
import UserProfileSendMessage from "./components/UserProfileSendMessage.tsx";

function UserProfile(props: { viewed_id: number; our_id?: number }) {
  const { viewed_id, our_id } = props;

  const [, setLocation] = useLocation();
  const { data: userDetail } = useUsersDetailGet({
    user_id: viewed_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  if (!userDetail) {
    return <Skeleton />;
  }

  const isViewingSelf = our_id != undefined && our_id !== userDetail.user_id;

  const image =
    userDetail.user_image ??
    avatarFallback({ label: userDetail.user_name, seed: userDetail.user_id });

  const socials_with_icon = userDetail.user_socials.map(({ social }) => {
    const type = linkParser(social);
    return {
      label: type !== "Other" ? type : "Link",
      icon: LinkIcons[type],
      value: social,
      link: social,
    };
  });

  const basic_data = [
    {
      link: `mailto:${userDetail.user_email}`,
      icon: <Email />,
      label: "Email",
      value: userDetail.user_email,
    },
    {
      icon: <Place />,
      label: "Lokasi",
      value: userDetail.user_location ?? undefined,
    },
    {
      icon: <Work />,
      label: "Tempat Kerja",
      value: userDetail.user_workplace ?? undefined,
    },
    {
      icon: <School />,
      label: "Tingkat Pendidkan",
      value: userDetail.user_education_level ?? undefined,
    },
    {
      icon: <School />,
      label: "Sekolah/Universitas",
      value: userDetail.user_school ?? undefined,
    },
    {
      icon: <Language />,
      label: "Website",
      link: userDetail.user_website ?? undefined,
      value: userDetail.user_website ?? undefined,
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          lg: 4,
        }}
      >
        <Stack alignItems={"center"} spacing={2}>
          <Avatar src={image} sx={{ width: 256, height: 256 }}></Avatar>
          {isViewingSelf ? (
            <UserProfileSendMessage our_user_id={our_id} viewed_user_id={userDetail.user_id} />
          ) : null}
          {isViewingSelf ? (
            <FriendShortcut our_user_id={our_id} viewed_user_id={userDetail.user_id} />
          ) : null}
          <UserProfileContribs user_id={viewed_id} />
          <UserFriendList user_id={viewed_id} />
          <UserProjectsList user_id={viewed_id} />
          <UserOrgsList user_id={viewed_id} />
        </Stack>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 8,
        }}
      >
        <Stack spacing={4}>
          <Paper
            sx={{
              px: 4,
              py: 2,
            }}
          >
            <Typography variant="h4" fontWeight={"bold"}>
              {userDetail.user_name}
            </Typography>
            <Grid container spacing={2} mt={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1}>
                  <Typography variant="h6">Data Diri</Typography>
                  {basic_data.map((x, i) => (
                    <StringLabel
                      key={i}
                      link={x.link}
                      icon={x.icon}
                      label={x.label}
                      value={x.value}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1}>
                  <Typography variant="h6">Media Sosial</Typography>
                  {socials_with_icon.length !== 0 ? (
                    socials_with_icon.map((x, i) => (
                      <StringLabel
                        link={x.link}
                        icon={x.icon}
                        label={x.label}
                        value={x.value}
                        key={i}
                      />
                    ))
                  ) : (
                    <Typography color="textSecondary">Belum diisi</Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper
            sx={{
              px: 4,
              py: 2,
            }}
          >
            <Typography variant="h6" fontWeight={"bold"} textAlign={"center"}>
              Tentang
            </Typography>
            <Typography
              sx={{
                whiteSpace: "pre-wrap",
              }}
            >
              {userDetail.user_about_me ? userDetail.user_about_me : "Belum ada informasi"}
            </Typography>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default UserProfile;
