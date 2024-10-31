import { Check, Close, Email } from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Skeleton,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Redirect } from "wouter";
import { useSessionGet } from "../queries/sesssion_hooks.ts";
import {
  useUsersDetailPreferencesGet,
  useUsersDetailPreferencesPut,
} from "../queries/user_hooks.ts";

function Settings(props: { user_id: number }) {
  const { user_id } = props;
  const { mutate: update } = useUsersDetailPreferencesPut({
    user_id,
  });
  const { data: prefs } = useUsersDetailPreferencesGet({
    user_id,
  });

  if (!prefs) {
    return <Skeleton />;
  }

  const settings = [
    {
      section: "Umum",
      entries: [
        {
          title: "Undangan Proyek",
          description: "Terima undangan dari pengurus organisasi untuk ikut terlibat dalam proyek.",
          type: "switch",
          value: prefs.project_invite === "on",
          onChange: (c: boolean) => {
            update({
              project_invite: c ? "on" : "off",
            });
          },
        },
        {
          title: "Pesan dari Pengguna Non-Teman",
          description: "Terima pesan masuk dari pengguna yang belum menjadi teman anda.",
          type: "switch",
          value: prefs.friend_invite === "on",
          onChange: (c: boolean) => {
            update({
              friend_invite: c ? "on" : "off",
            });
          },
        },
      ],
    },
    {
      section: "Notifikasi",
      entries: [
        {
          title: "Proyek",
          description: "Terima notifikasi terkait keanggotaan proyek.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.project_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              project_notif: c,
            });
          },
        },
        {
          title: "Organisasi",
          description: "Terima notifikasi terkait keanggotaan organisasi.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.org_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              org_notif: c,
            });
          },
        },
        {
          title: "Pesan",
          description: "Terima notifikasi untuk pesan yang ditujukan kepada anda.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.msg_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              msg_notif: c,
            });
          },
        },
        {
          title: "Laporan",
          description: "Terima notifikasi terkait laporan yang anda buat.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.report_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              report_notif: c,
            });
          },
        },
        {
          title: "Tugas",
          description: "Terima notifikasi terkait tugas yang diberikan kepada anda.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.task_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              task_notif: c,
            });
          },
        },
        {
          title: "Kontribusi",
          description: "Terima notifikasi terkait pencatatan kontribusi yang anda kerjakan.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.contrib_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              contrib_notif: c,
            });
          },
        },
        {
          title: "Teman",
          description: "Terima notifikasi terkait permintaan teman.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: prefs.friend_notif,
          onChange: (c: "off" | "on" | "email") => {
            update({
              friend_notif: c,
            });
          },
        },
      ],
    },
  ] as const;

  return (
    <Box>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Preferensi
      </Typography>
      <List>
        {settings.map((section, s) => {
          return [
            <ListSubheader key={s}>{section.section}</ListSubheader>,
            section.entries.map((setting, i) => (
              <ListItem key={`${s}-${i}`}>
                <ListItemText primary={setting.title} secondary={setting.description} />
                <ListItemIcon>
                  {setting.type === "switch" ? (
                    <Switch
                      checked={setting.value}
                      onChange={(e) => {
                        setting.onChange(e.target.checked);
                      }}
                    />
                  ) : setting.type === "choice" ? (
                    <ToggleButtonGroup
                      exclusive
                      value={setting.value}
                      onChange={(_, v) => {
                        setting.onChange(v);
                      }}
                    >
                      {setting.choice.map((x) => (
                        <ToggleButton value={x} key={x}>
                          {x === "off" ? <Close /> : x === "on" ? <Check /> : <Email />}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  ) : null}
                </ListItemIcon>
              </ListItem>
            )),
          ];
        })}
      </List>
    </Box>
  );
}

function SettingsPage() {
  const { data: session } = useSessionGet();
  if (session == undefined) {
    return <Skeleton />;
  }
  if (session.logged) {
    return <Settings user_id={session.user_id} />;
  } else {
    return <Redirect to={"/"} />;
  }
}

export default SettingsPage;
