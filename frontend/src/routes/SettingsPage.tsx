import { List, ListItem, ListItemIcon, ListItemText, ListSubheader, Switch } from "@mui/material";

function Settings() {
  const settings = [
    {
      section: "Umum",
      entries: [
        {
          title: "Undangan Proyek",
          description: "Terima undangan dari pengurus organisasi untuk ikut terlibat dalam proyek.",
        },
        {
          title: "Pesan dari Pengguna Non-Teman",
          description: "Terima pesan masuk dari pengguna yang belum menjadi teman anda.",
        },
      ],
    },
    {
      section: "Notifikasi",
      entries: [
        {
          title: "Proyek",
          description: "Terima notifikasi terkait keanggotaan proyek.",
        },
        {
          title: "Organisasi",
          description: "Terima notifikasi terkait keanggotaan organisasi.",
        },
        {
          title: "Pesan",
          description: "Terima notifikasi untuk pesan yang ditujukan kepada anda.",
        },
        {
          title: "Laporan",
          description: "Terima notifikasi terkait laporan yang anda buat.",
        },
        {
          title: "Tugas",
          description: "Terima notifikasi terkait tugas yang diberikan kepada anda.",
        },
        {
          title: "Kontribusi",
          description: "Terima notifikasi terkait pencatatan kontribusi yang anda kerjakan.",
        },
        {
          title: "Teman",
          description: "Terima notifikasi terkait permintaan teman.",
        },
      ],
    },
  ];

  return (
    <List>
      {settings.map((section, s) => {
        return [
          <ListSubheader key={s}>{section.section}</ListSubheader>,
          section.entries.map((setting, i) => (
            <ListItem key={`${s}-${i}`}>
              <ListItemText primary={setting.title} secondary={setting.description} />
              <ListItemIcon>
                <Switch />
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
