import { buildPaginationMeta } from "./build-pagination-meta";

describe("buildPaginationMeta", () => {
  it("computes total_pages from total and limit", () => {
    expect(buildPaginationMeta(87, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      total: 87,
      total_pages: 5,
    });
  });

  it("returns zero total_pages when total is zero", () => {
    expect(buildPaginationMeta(0, 1, 20).total_pages).toBe(0);
  });
});
