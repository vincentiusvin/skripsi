import { SelectQueryBuilder } from "kysely";

export function paginateQuery<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  opts: {
    page?: number;
    limit?: number;
  },
) {
  const { page, limit } = opts;
  if (limit != undefined) {
    query = query.limit(limit);
  }

  if (page != undefined && limit != undefined) {
    const offset = (page - 1) * limit;
    query = query.offset(offset);
  }

  return query;
}
