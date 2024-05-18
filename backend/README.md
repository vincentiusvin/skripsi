# Getting Started

Untuk buat Request Handler bisa ikutin template ini:

```ts
export const fn: RH = async function (req, res) {
  res.json({ msg: "Halo" });
};
```

RH diimport dulu. Ctrl+Space aja. Kalau gak muncul lokasinya ada di [sini](src/helpers/types.ts)

Habis itu fungsinya di-register di [sini](src/routes.ts)
Taruh di dalam `registerRoutes` dan juga di `_api`.

```ts
export function registerRoutes(app: Express) {
  ...
  app.get("/api/route-ikutin-rest", fn);
  ...
}
```

```ts
type _api = {
  ...
  NamaKeyBebasTapiRapih: typeof fn;
  ...
};
```

# Type Safety

RH itu generic, bisa kita masukin tipe data yang kita mau biar kodenya type-safe:

```ts
export const fn: RH<{
  ResBody: { msg: string };
}> = async function (req, res) {
  res.json({ msg: "Halo" });
};
```

Tipe data yang tersedia dan penjelasannya bisa dibaca di [sini](src/helpers/types.ts).

# Error Handling

Kalau ada error dan mau kirim error ke user, bisa langsung di throw aja. Jangan dibuat manual di objek res.
Error bakal dikirim dalam bentuk `{msg: string}`, tapi ga perlu di-declare di type RH. bakal di-handle otomatis sama middleware.

```ts
export const fn: RH = async function (req, res) {
  throw new ClientError("User salah input");
};
```

Jenis error yang berbeda bakal nge-return HTTP status code yang berbeda.
Lebih lengkapnya bisa dilihat di [sini](src/helpers/error.ts).
