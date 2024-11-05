import { Autocomplete, MenuItem, Paper, Stack, TextField } from "@mui/material";
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

  return (
    <Autocomplete
      fullWidth
      options={all}
      multiple
      getOptionLabel={(v) => v.toString()}
      value={current_users}
      disableCloseOnSelect
      onChange={(e, v) => {
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
