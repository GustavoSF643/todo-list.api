import { BadRequestException } from "@nestjs/common";

import type { PaginationQueryDto } from "./pagination-query.dto";
import type { PaginationParams } from "./pagination.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(
  value: unknown,
  field: "page" | "limit",
): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestException(
      `Parâmetro '${field}' deve ser um inteiro maior ou igual a 1.`,
    );
  }

  return parsed;
}

export function parsePaginationQuery(
  query: PaginationQueryDto = {},
): PaginationParams {
  const page = parsePositiveInt(query.page, "page") ?? DEFAULT_PAGE;
  const rawLimit = parsePositiveInt(query.limit, "limit") ?? DEFAULT_LIMIT;
  const limit = Math.min(rawLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}
