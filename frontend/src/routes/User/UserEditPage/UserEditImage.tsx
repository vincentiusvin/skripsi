import { AddAPhoto, Edit } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ImageDropzone from "../../../components/Dropzone.tsx";
import avatarFallback from "../../../helpers/avatar_fallback.tsx";
import { fileToBase64DataURL } from "../../../helpers/file.ts";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import { useUserEditContext } from "./context.tsx";

function UserEditImage(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });
  const [userEdit, setUserEdit] = useUserEditContext();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  if (data == undefined) {
    return <Skeleton />;
  }

  const old_image =
    data.user_image ?? avatarFallback({ label: data.user_name, seed: data.user_id });

  return (
    <>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Add Image</DialogTitle>
        <DialogContent>
          <ImageDropzone
            sx={{
              cursor: "pointer",
            }}
            onChange={async (file) => {
              const b64 = file ? await fileToBase64DataURL(file) : undefined;
              setUserEdit((x) => ({
                ...x,
                user_image: b64,
              }));
              setModalOpen(false);
            }}
          >
            {userEdit.user_image ? (
              <Avatar
                src={userEdit.user_image ?? old_image}
                variant="rounded"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              ></Avatar>
            ) : (
              <Stack
                alignItems={"center"}
                minHeight={250}
                justifyContent={"center"}
                sx={{
                  cursor: "pointer",
                }}
              >
                <AddAPhoto
                  sx={{
                    width: 100,
                    height: 100,
                  }}
                />
                <Typography textAlign={"center"}>
                  Tarik atau tekan di sini untuk mengupload gambar!
                </Typography>
              </Stack>
            )}
          </ImageDropzone>
        </DialogContent>
      </Dialog>
      <Stack alignItems={"center"}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Button
              variant="contained"
              onClick={() => {
                setModalOpen(true);
              }}
            >
              <Edit />
            </Button>
          }
        >
          <Avatar src={userEdit.user_image ?? old_image} sx={{ width: 256, height: 256 }}></Avatar>
        </Badge>
      </Stack>
    </>
  );
}
export default UserEditImage;
