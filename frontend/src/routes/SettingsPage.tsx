import { Check, Close, Email } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";

function Settings() {
  const [config, setConfig] = useState({
    projectInvite: false,
    friendInvite: false,
    projectNotif: "off",
    orgNotif: "off",
    msgNotif: "off",
    reportNotif: "off",
    taskNotif: "off",
    contribNotif: "off",
    friendNotif: "off",
  });

  const settings = [
    {
      section: "Umum",
      entries: [
        {
          title: "Undangan Proyek",
          description: "Terima undangan dari pengurus organisasi untuk ikut terlibat dalam proyek.",
          type: "switch",
          value: config.projectInvite,
          onChange: (c: boolean) => {
            setConfig((x) => {
              return {
                ...x,
                projectInvite: c,
              };
            });
          },
        },
        {
          title: "Pesan dari Pengguna Non-Teman",
          description: "Terima pesan masuk dari pengguna yang belum menjadi teman anda.",
          type: "switch",
          value: config.friendInvite,
          onChange: (c: boolean) => {
            setConfig((x) => {
              return {
                ...x,
                friendInvite: c,
              };
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
          value: config.projectNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                projectNotif: c,
              };
            });
          },
        },
        {
          title: "Organisasi",
          description: "Terima notifikasi terkait keanggotaan organisasi.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: config.orgNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                orgNotif: c,
              };
            });
          },
        },
        {
          title: "Pesan",
          description: "Terima notifikasi untuk pesan yang ditujukan kepada anda.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: config.msgNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                msgNotif: c,
              };
            });
          },
        },
        {
          title: "Laporan",
          description: "Terima notifikasi terkait laporan yang anda buat.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: config.reportNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                reportNotif: c,
              };
            });
          },
        },
        {
          title: "Tugas",
          description: "Terima notifikasi terkait tugas yang diberikan kepada anda.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: config.taskNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                taskNotif: c,
              };
            });
          },
        },
        {
          title: "Kontribusi",
          description: "Terima notifikasi terkait pencatatan kontribusi yang anda kerjakan.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: config.contribNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                contribNotif: c,
              };
            });
          },
        },
        {
          title: "Teman",
          description: "Terima notifikasi terkait permintaan teman.",
          type: "choice",
          choice: ["off", "on", "email"],
          value: config.friendNotif,
          onChange: (c: "off" | "on" | "email") => {
            setConfig((x) => {
              return {
                ...x,
                friendNotif: c,
              };
            });
          },
        },
      ],
    },
  ] as const;

  return (
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
                    value={setting.value}
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
  );
}

function SettingsPage() {
  return <Settings />;
}

export default SettingsPage;
