import { Email, Language, Person, Place, School } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import StringLabel from "../../../components/StringLabel.tsx";
import { LinkIcons, linkParser, parseURL } from "../../../helpers/linker.tsx";
import { handleOptionalStringCreation } from "../../../helpers/misc.ts";
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

  const links = reg.social_medias
    .filter((x) => x.length !== 0)
    .map((x) => {
      try {
        return parseURL(x).href;
      } catch (e) {
        return x;
      }
    });

  let websiteCleaned: string | undefined = reg.website;
  if (reg.website != undefined) {
    try {
      websiteCleaned = parseURL(reg.website ?? "").href;
    } catch (e) {
      e;
    }
  }

  function register() {
    postUsers({
      user_name: reg.username,
      user_password: reg.password,
      user_email: reg.email,
      user_education_level: handleOptionalStringCreation(reg.education),
      user_school: handleOptionalStringCreation(reg.school),
      user_website: handleOptionalStringCreation(websiteCleaned),
      user_socials: links,
    });
  }

  const simple_datas = [
    {
      label: "Username",
      icon: <Person />,
      value: reg.username,
      link: undefined,
    },
    {
      label: "Email",
      icon: <Email />,
      value: reg.email,
      link: `mailto:${reg.email}`,
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
      value: websiteCleaned,
      link: websiteCleaned,
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
      link: x,
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
            <StringLabel key={i} link={x.link} icon={x.icon} value={x.value} label={x.label} />
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
              <StringLabel key={i} link={x.link} icon={x.icon} value={x.value} label={x.label} />
            ))}
          </Stack>
        ) : (
          <Typography variant="body1" color="textSecondary">
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
