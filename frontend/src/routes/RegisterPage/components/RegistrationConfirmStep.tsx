import { Email, Language, Person, Place, School } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import StyledLink from "../../../components/StyledLink.tsx";
import { LinkIcons, linkParser, parseURL } from "../../../helpers/linker.tsx";
import { useUsersPost } from "../../../queries/user_hooks.ts";
import { useRegistrationContext } from "./context.tsx";

function RegistrationConfirmStep(props: { back: () => void; cont: () => void }) {
  const [reg] = useRegistrationContext();
  const { back, cont } = props;
  const { mutate: postUsers } = useUsersPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil mendaftarkan akun!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      cont();
    },
  });

  function register() {
    postUsers({
      user_name: reg.username,
      user_password: reg.password,
    });
  }

  const links = reg.social_medias
    .filter((x) => x.length !== 0)
    .map((x) => {
      try {
        return parseURL(x).href;
      } catch (e) {
        return x;
      }
    });

  const simple_datas = [
    {
      label: "Username",
      icon: <Person />,
      value: reg.username,
    },
    {
      label: "Email",
      icon: <Email />,
      value: reg.email,
    },
    {
      label: "Tingkat Pendidikan",
      icon: <School />,
      value: reg.school,
    },
    {
      label: "Sekolah/Universitas",
      icon: <School />,
      value: reg.education,
    },
    {
      label: "Website",
      icon: <Language />,
      value: reg.website,
    },
    {
      label: "Lokasi",
      icon: <Place />,
      value: reg.location,
    },
  ];

  const link_data = links.map((x) => {
    const type = linkParser(x);
    return {
      label: type !== "Other" ? type : "Link",
      icon: LinkIcons[type],
      value: x,
    };
  });

  return (
    <Grid container rowSpacing={4} columnSpacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" mb={2}>
          Informasi Akun
        </Typography>
        <Stack spacing={1}>
          {simple_datas.map((x, i) => (
            <Stack key={i} direction="row" gap={2} alignItems={"center"}>
              {x.icon}
              <Stack>
                <Typography variant="caption">{x.label}</Typography>
                {x.value != undefined && x.value.length !== 0 ? (
                  <Typography variant="body1">{x.value}</Typography>
                ) : (
                  <Typography color="gray">Belum diisi</Typography>
                )}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" mb={2}>
          Media Sosial
        </Typography>
        {link_data.length !== 0 ? (
          <Stack spacing={1}>
            {link_data.map((x, i) => (
              <Stack key={i} direction="row" gap={2} alignItems={"center"}>
                {x.icon}
                <Stack>
                  <Typography variant="caption">{x.label}</Typography>
                  {x.value.length !== 0 ? (
                    <StyledLink to={x.value}>
                      <Typography variant="body1">{x.value}</Typography>
                    </StyledLink>
                  ) : (
                    <Typography color="gray">Belum diisi</Typography>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body1" color="gray">
            Belum diisi
          </Typography>
        )}
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={2}>
          <Button fullWidth onClick={() => back()} variant="outlined">
            Mundur
          </Button>
          <Button fullWidth onClick={register} variant="contained">
            Daftar
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default RegistrationConfirmStep;
