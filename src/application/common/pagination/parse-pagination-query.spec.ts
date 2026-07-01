import { BadRequestException } from "@nestjs/common";

import { parsePaginationQuery } from "./parse-pagination-query";

describe("parsePaginationQuery", () => {
  it("uses defaults when query is empty", () => {
    expect(parsePaginationQuery({})).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
      take: 20,
    });
  });

  it("parses custom page and limit", () => {
    expect(parsePaginationQuery({ page: 2, limit: 10 })).toEqual({
      page: 2,
      limit: 10,
      skip: 10,
      take: 10,
    });
  });

  it("clamps limit to 100", () => {
    expect(parsePaginationQuery({ limit: 500 }).limit).toBe(100);
    expect(parsePaginationQuery({ limit: 500 }).take).toBe(100);
  });

  it("throws for invalid page", () => {
    expect(() => parsePaginationQuery({ page: 0 })).toThrow(
      BadRequestException,
    );
  });

  it("throws for invalid limit", () => {
    expect(() => parsePaginationQuery({ limit: 0 })).toThrow(
      BadRequestException,
    );
  });
});
