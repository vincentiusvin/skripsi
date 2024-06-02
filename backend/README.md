# Getting Started

Untuk buat Request Handler bisa taruh method dengan template ini ke dalam class `Controller`:

```ts
private fn: RH = async (req, res) => {
  res.json({ msg: "Halo" });
};
```

RH diimport dulu. Ctrl+Space aja. Kalau gak muncul lokasinya ada di [sini](src/helpers/types.ts)

Habis itu fungsinya di-register di method `init()` nya controller.

```ts
  init() {
    return {
      NamaKey: new Route({
        handler: this.fn,
        method: "get",
        path: "/api/fn",
      }),
    };
  }
```

Handler itu function pointer ke fungsi kita tadi, method itu method HTTP-nya, dan path itu path APInya.

Kita bisa tambain prior (middleware) atau schema (pakai zod) kalau mau.

# Type Safety

RH itu generic, bisa kita masukin tipe data yang kita mau biar kodenya type-safe:

```ts
private fn: RH<{
  ResBody: { msg: string };
}> = async (req, res) => {
  res.json({ msg: "Halo" });
};
```

Tipe data yang tersedia dan penjelasannya bisa dibaca di [sini](src/helpers/types.ts).

# Error Handling

Kalau ada error dan mau kirim error ke user, bisa langsung di throw aja. Jangan dibuat manual di objek res.
Error bakal dikirim dalam bentuk `{msg: string}`, tapi ga perlu di-declare di type RH. bakal di-handle otomatis sama middleware.

```ts
private fn: RH = async (req, res) => {
  throw new ClientError("User salah input");
};
```

Jenis error yang berbeda bakal nge-return HTTP status code yang berbeda.
Lebih lengkapnya bisa dilihat di [sini](src/helpers/error.ts).
