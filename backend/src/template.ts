export type EmptyParams = never; // Param itu data kiriman yang ada di URL, http://website/api/items?page=1
export type EmptyResBody = never; // ResBody itu jawaban dari server
export type EmptyReqBody = never; // ReqBody itu data kiriman yang gaada di url
export type EmptyReqQuery = never; // ReqQuery itu data yang ada langsung di pathnya, http://website/api/user/1
export type EmptyLocals = never;

// Untuk template bisa ikutin ini:
// const fn: RequestHandler<
//   EmptyParams,
//   EmptyResBody,
//   EmptyReqBody,
//   EmptyReqQuery,
//   EmptyLocals
// > = function (req, res) {
//   return;
// };

// Lalu register fungsinya ke index.ts dan exports.d.ts

// Top type dari RequestHandler itu:
// type parent = RequestHandler<never, unknown, never, never, never>;

// Dog --extends--> Animal

// RequestHandler itu fungsi
// Params, ReqBody, ReqQuery, dan Locals itu properti di parameter fungsi
// Mereka contravariant terhadap generic kita
// Gen<Dog> <--extends-- Gen<Animal>

// ResBody beda sendiri, dia itu return type di method pada parameter fungsi
// Dia covariant terhadap generic kita
// Gen<Dog> --extends--> Gen<Animal>

// never --subclass--> unknown

// bisa di-check langsung
// type subclass = RequestHandler<unknown, never, never, never, unknown>;

// type check = subclass extends parent ? true : false;
