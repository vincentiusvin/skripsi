import { FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { useState } from "react";
import UserImage from "./UserImage.tsx";
import UserLabel from "./UserLabel.tsx";

function UserSelectMinimal(props: {
  label: string;
  current_users: number[];
  allowed_users: number[];
  onSave?: (x: number[]) => void;
}) {
  const { label, current_users, allowed_users } = props;

  const [newUsers, setNewUsers] = useState<number[]>(current_users);
  const all = [...new Set([...current_users, ...allowed_users])];

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        label="Kontributor"
        multiple
        value={newUsers}
        onChange={(e) => {
          setNewUsers(e.target.value as number[]);
        }}
        renderValue={(sel) => (
          <Stack direction={"row"} gap={2}>
            {sel.map((x) => (
              <UserImage key={x} user_id={x} />
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
