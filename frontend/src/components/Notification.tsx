import { Notifications } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import {
  useNotificationsGet,
  useNotificationsMassPut,
  useNotificationsPut,
} from "../queries/notification_hooks.ts";
import StyledLink from "./StyledLink.tsx";

type NotificationData = NonNullable<ReturnType<typeof useNotificationsGet>["data"]>[number];

function resolveNotificationLink(type: NotificationData["type"], type_id: number | null) {
  if (type === "Proyek" || type === "Tugas") {
    return `/projects/${type_id}`;
  }
  if (type === "Diskusi Pribadi" || type === "Diskusi Proyek") {
    return `/chatroom-forwarder/${type_id}`;
  }
  if (type === "Organisasi") {
    return `/orgs/${type_id}`;
  }
  if (type === "Laporan") {
    return `/reports/${type_id}`;
  }
  if (type === "Teman") {
    return `/users/${type_id}`;
  }
  if (type === "Kontribusi") {
    return `/contributions/${type_id}`;
  }
}

function NotificationEntry(props: { notification_data: NotificationData; onClick?: () => void }) {
  const { notification_data, onClick } = props;
  const { mutate } = useNotificationsPut({
    notification_id: notification_data.id,
  });

  const link = resolveNotificationLink(notification_data.type, notification_data.type_id);

  const notificationContent = (
    <CardActionArea
      sx={{
        paddingX: 4,
        paddingY: 2,
      }}
      disabled={link == undefined}
      onClick={() => {
        if (link == undefined) {
          return;
        }
        if (notification_data.read == false) {
          mutate({
            read: true,
          });
        }
        if (onClick) {
          onClick();
        }
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
    </CardActionArea>
  );

  return (
    <Card key={notification_data.id}>
      {link != undefined ? (
        <StyledLink to={link}>{notificationContent}</StyledLink>
      ) : (
        notificationContent
      )}
      <Stack
        direction={"row"}
        alignItems={"center"}
        sx={{
          paddingX: 4,
          paddingY: 1,
        }}
      >
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
    </Card>
  );
}

const NotificationFilterOptions = [
  "Semua",
  "Proyek",
  "Organisasi",
  "Pesan",
  "Laporan",
  "Tugas",
  "Kontribusi",
  "Teman",
] as const;

function NotificationDialog(props: { user_id: number }) {
  const { user_id } = props;
  const { data: notification } = useNotificationsGet({
    user_id,
  });
  const { mutate: readAll } = useNotificationsMassPut({
    user_id,
  });
  const [filter, setFilter] = useState<(typeof NotificationFilterOptions)[number]>("Semua");
  const [openNotification, setOpenNotification] = useState(false);
  const unread = notification?.filter((x) => x.read == false).length;

  const filtered = notification?.filter((x) => {
    if (filter === "Semua") {
      return true;
    }
    if (x.type === filter) {
      return true;
    }
    if (filter === "Pesan") {
      return x.type === "Diskusi Pribadi" || x.type === "Diskusi Proyek";
    }
    return false;
  });

  return (
    <>
      {unread != undefined ? (
        <Badge badgeContent={unread} color="primary">
          <IconButton variant="outlined" onClick={() => setOpenNotification(true)}>
            <Notifications />
          </IconButton>
        </Badge>
      ) : (
        <IconButton variant="outlined" onClick={() => setOpenNotification(true)}>
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
          <Tabs
            sx={{
              marginBottom: 2,
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            value={filter}
            onChange={(_, nv) => {
              setFilter(nv);
            }}
          >
            {NotificationFilterOptions.map((x) => (
              <Tab key={x} value={x} label={x} />
            ))}
          </Tabs>

          {filtered != undefined ? (
            <Stack direction={"column"} spacing={2}>
              {filtered.map((x) => (
                <NotificationEntry
                  key={x.id}
                  notification_data={x}
                  onClick={() => setOpenNotification(false)}
                />
              ))}
            </Stack>
          ) : (
            <Skeleton />
          )}
        </DialogContent>
        <DialogActions>
          {unread != undefined ? (
            unread > 0 ? (
              <Button onClick={() => readAll({ read: true })}>Tanda Semua Sebagai Dibaca</Button>
            ) : (
              <Button onClick={() => readAll({ read: false })}>
                Tanda Semua Sebagai Belum Dibaca
              </Button>
            )
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NotificationDialog;
