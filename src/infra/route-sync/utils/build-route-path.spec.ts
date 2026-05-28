import { buildRoutePath } from "./build-route-path";

describe("buildRoutePath", () => {
  it("combines controller and handler paths", () => {
    expect(buildRoutePath("users", ":id")).toBe("/users/:id");
  });

  it("returns controller path when handler path is empty", () => {
    expect(buildRoutePath("users", "")).toBe("/users");
  });

  it("returns root when both paths are empty", () => {
    expect(buildRoutePath("", "")).toBe("/");
  });

  it("collapses duplicate slashes", () => {
    expect(buildRoutePath("users/", "/:id")).toBe("/users/:id");
  });
});
