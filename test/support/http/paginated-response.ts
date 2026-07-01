export function paginatedResponse<T>(
  data: T[],
  meta?: Partial<{
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }>,
) {
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? 20;
  const total = meta?.total ?? data.length;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      total_pages:
        meta?.total_pages ?? (total === 0 ? 0 : Math.ceil(total / limit)),
    },
  };
}
