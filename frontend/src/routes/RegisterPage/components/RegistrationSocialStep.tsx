import { Add, Remove } from "@mui/icons-material";
import { Button, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { LinkIcons, linkParser } from "../../../helpers/linker.tsx";
import { useList } from "../../../helpers/misc.ts";
import { useRegistrationContext } from "./context.tsx";

function RegistrationSocialStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg, setRegistration] = useRegistrationContext();
  const [socials, { removeAt, push, updateAt }] = useList<string>(reg.social_medias ?? []);

  function updateReg() {
    setRegistration((x) => ({
      ...x,
      social_medias: socials,
    }));
  }

  return (
    <Stack spacing={2}>
      <Stack direction={"row"} alignItems={"center"}>
        <Typography variant="h6" fontWeight={"bold"} flexGrow={1}>
          Akun media sosial
        </Typography>
        <IconButton onClick={() => push("")}>
          <Add />
        </IconButton>
      </Stack>
      {socials.map((x, i) => {
        const try_parse = linkParser(x);
        return (
          <Stack key={i} direction="row" alignItems={"center"}>
            <TextField
              label={try_parse !== "Other" ? try_parse : "Link"}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">{LinkIcons[try_parse]}</InputAdornment>
                  ),
                },
              }}
              value={x}
              onChange={(e) => {
                updateAt(i, e.target.value);
              }}
            />
            <IconButton
              onClick={() => {
                removeAt(i);
              }}
            >
              <Remove />
            </IconButton>
          </Stack>
        );
      })}
      <Stack direction="row" spacing={2}>
        <Button
          fullWidth
          onClick={() => {
            updateReg();
            back();
          }}
          variant="outlined"
        >
          Mundur
        </Button>
        <Button
          fullWidth
          onClick={() => {
            updateReg();
            cont();
          }}
          variant="contained"
        >
          Lanjut
        </Button>
      </Stack>
    </Stack>
  );
}
export default RegistrationSocialStep;
