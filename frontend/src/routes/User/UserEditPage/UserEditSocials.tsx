import { Add, Remove } from "@mui/icons-material";
import { IconButton, InputAdornment, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { LinkIcons, linkParser } from "../../../helpers/linker.tsx";
import { useList } from "../../../helpers/misc.ts";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import { useUserEditContext } from "./context.tsx";

function UserEditSocials(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });

  if (data == undefined) {
    return <Skeleton />;
  }
  return <UserEditSocialsLoaded social_medias={data.user_socials.map((x) => x.social)} />;
}

function UserEditSocialsLoaded(props: { social_medias: string[] }) {
  const { social_medias } = props;
  const [, setUserEdit] = useUserEditContext();
  const [socials, { removeAt, push, updateAt }] = useList<string>(social_medias);

  useEffect(() => {
    setUserEdit((x) => ({
      ...x,
      user_socials: socials,
    }));
  }, [socials, setUserEdit]);

  return (
    <Stack spacing={2}>
      <Stack direction={"row"} alignItems={"center"}>
        <Typography variant="h6" fontWeight={"bold"} flexGrow={1}>
          Akun media sosial
        </Typography>
        <IconButton
          onClick={() => {
            push("");
          }}
        >
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
    </Stack>
  );
}

export default UserEditSocials;
