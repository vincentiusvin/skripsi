import { FormControl, InputLabel, MenuItem, Paper, Select, Stack } from "@mui/material";
import UserLabel from "./UserLabel.tsx";

function UserSelectMinimal(props: {
  label?: string;
  current_users: number[];
  allowed_users: number[];
  onChange?: (x: number[]) => void;
}) {
  const { onChange: onChange, label, current_users, allowed_users } = props;

  const all = [...new Set([...current_users, ...allowed_users])];

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        multiple
        value={current_users}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value as number[]);
          }
        }}
        renderValue={(sel) => (
          <Stack direction={"row"} gap={2}>
            {sel.map((x) => (
              <Paper
                key={x}
                sx={{
                  padding: 1,
                }}
              >
                <UserLabel user_id={x} disableImage />
              </Paper>
            ))}
          </Stack>
        )}
      >
        {all.map((user_id) => {
          return (
            <MenuItem value={user_id} key={user_id}>
              <UserLabel user_id={user_id} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default UserSelectMinimal;
