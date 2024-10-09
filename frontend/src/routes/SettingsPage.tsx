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

function Settings() {
  const settings = [
    {
      section: "Umum",
      entries: [
        {
          title: "Undangan Proyek",
          description: "Terima undangan dari pengurus organisasi untuk ikut terlibat dalam proyek.",
          type: "switch",
          value: true,
          onChange: (c: boolean) => {
            console.log(c);
          },
        },
        {
          title: "Pesan dari Pengguna Non-Teman",
          description: "Terima pesan masuk dari pengguna yang belum menjadi teman anda.",
          type: "switch",
          value: true,
          onChange: (c: boolean) => {
            console.log(c);
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
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
          },
        },
        {
          title: "Organisasi",
          description: "Terima notifikasi terkait keanggotaan organisasi.",
          type: "choice",
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
          },
        },
        {
          title: "Pesan",
          description: "Terima notifikasi untuk pesan yang ditujukan kepada anda.",
          type: "choice",
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
          },
        },
        {
          title: "Laporan",
          description: "Terima notifikasi terkait laporan yang anda buat.",
          type: "choice",
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
          },
        },
        {
          title: "Tugas",
          description: "Terima notifikasi terkait tugas yang diberikan kepada anda.",
          type: "choice",
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
          },
        },
        {
          title: "Kontribusi",
          description: "Terima notifikasi terkait pencatatan kontribusi yang anda kerjakan.",
          type: "choice",
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
          },
        },
        {
          title: "Teman",
          description: "Terima notifikasi terkait permintaan teman.",
          type: "choice",
          value: "email",
          choice: ["off", "on", "email"],
          onChange: (c: "off" | "on" | "email") => {
            console.log(c);
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
