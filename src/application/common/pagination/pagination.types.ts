export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};
