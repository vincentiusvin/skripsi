- snake_case untuk semua nama
- Nama tabel plural
- Untuk tabel pivot (many to many), buat plural di setiap katanya. Urut berdasarkan abjad.
- Nama kolom singular, untuk kolom foreign key di prefix dengan nama tabelnya secara singular.
  Contoh: foreign key ke tabel users dinamain user_id
- Untuk tabel yang nyambung (secara logis, bukan secara SQL) sama tabel lain, dibuat plural di kata terakhir.
  Contoh: tabel yg nyimpen kategori untuk projek2 dinamain category_projects.
