import { Autocomplete, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useUsersGet } from "../queries/user_hooks.ts";
import UserLabel from "./UserLabel.tsx";

function UserSelect(props: {
  label?: string;
  current_users: number[];
  allowed_users: number[];
  onChange?: (x: number[]) => void;
  required?: boolean;
}) {
  const { required, onChange: onChange, label, current_users, allowed_users } = props;

  const all = [...new Set([...current_users, ...allowed_users])].sort();
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const { data: users } = useUsersGet({ keyword: debouncedKeyword });

  const options = users?.filter((x) => all.includes(x.user_id)).map((x) => x.user_id) ?? [];

  return (
    <Autocomplete
      fullWidth
      options={options}
      multiple
      onInputChange={(e, v) => {
        setKeyword(v);
      }}
      filterOptions={(x) => x}
      getOptionLabel={(v) => v.toString()}
      value={current_users}
      disableCloseOnSelect
      onChange={(_, v) => {
        if (onChange) {
          onChange(v);
        }
      }}
      renderTags={(sel) => (
        <Stack direction={"row"} rowGap={1} columnGap={2} flexWrap={"wrap"}>
          {sel.map((x) => (
            <Paper
              key={x}
              sx={{
                padding: 1,
              }}
            >
              <UserLabel size="small" user_id={x} disableImage />
            </Paper>
          ))}
        </Stack>
      )}
      renderOption={(p, id) => {
        const { key, ...inputProps } = p;
        return (
          <MenuItem key={key} {...inputProps}>
            <UserLabel size="small" user_id={id} />
          </MenuItem>
        );
      }}
      renderInput={(p) => <TextField {...p} label={label} required={required} />}
    />
  );
}

export default UserSelect;
