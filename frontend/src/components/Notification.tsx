import { Notifications } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useNotificationsGet, useNotificationsPut } from "../queries/notification_hooks.ts";

function NotificationEntry(props: {
  notification_data: NonNullable<ReturnType<typeof useNotificationsGet>["data"]>[number];
}) {
  const { notification_data } = props;
  const { mutate } = useNotificationsPut({
    notification_id: notification_data.id,
  });

  return (
    <Paper
      key={notification_data.id}
      sx={{
        paddingX: 4,
        paddingY: 2,
      }}
    >
      <Typography
        variant="h6"
        fontWeight={"bold"}
        sx={{
          wordBreak: "break-word",
        }}
      >
        {notification_data.title}
      </Typography>
      <Typography
        sx={{
          wordBreak: "break-word",
        }}
      >
        {notification_data.description}
      </Typography>
      <Stack direction={"row"} alignItems={"center"}>
        <Typography variant="caption">
          {dayjs(notification_data.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
        </Typography>
        <Box flexGrow={1}></Box>
        {notification_data.read ? (
          <Button onClick={() => mutate({ read: false })}>
            <Typography variant="caption">Tandai sebagai belum dibaca</Typography>
          </Button>
        ) : (
          <Button onClick={() => mutate({ read: true })}>
            <Typography variant="caption">Tandai sebagai dibaca</Typography>
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function NotificationDialog(props: { user_id: number }) {
  const { user_id } = props;
  const { data: notification } = useNotificationsGet({
    user_id,
  });
  const [openNotification, setOpenNotification] = useState(false);
  const unread = notification?.filter((x) => x.read == false).length;
  return (
    <>
      {unread != undefined ? (
        <Badge badgeContent={unread} color="primary">
          <IconButton onClick={() => setOpenNotification(true)}>
            <Notifications />
          </IconButton>
        </Badge>
      ) : (
        <IconButton onClick={() => setOpenNotification(true)}>
          <Notifications />
        </IconButton>
      )}
      <Dialog open={openNotification} onClose={() => setOpenNotification(false)}>
        <DialogTitle> Notifikasi</DialogTitle>
        <DialogContent
          sx={{
            minWidth: {
              sm: 320,
              md: 480,
            },
          }}
        >
          {notification != undefined ? (
            <Stack direction={"column"} spacing={2}>
              {notification.map((x) => (
                <NotificationEntry key={x.id} notification_data={x} />
              ))}
            </Stack>
          ) : (
            <Skeleton />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NotificationDialog;
