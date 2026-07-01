import { PaginatedResponseDto } from "./paginated-response.dto";
import { buildPaginationMeta } from "./build-pagination-meta";
import type { PaginationParams } from "./pagination.types";

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams,
): PaginatedResponseDto<T> {
  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
}
