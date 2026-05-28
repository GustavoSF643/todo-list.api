/**
 * Builds the Express-style route pattern used by PermissionsGuard
 * (`baseUrl` + `route.path`).
 */
export function buildRoutePath(
  controllerPath: string,
  routePath: string,
): string {
  const segments = [controllerPath, routePath]
    .filter((segment) => segment.length > 0)
    .join("/");
  const withLeadingSlash = segments ? `/${segments}` : "/";
  const normalized = withLeadingSlash.replace(/\/+/g, "/");
  if (normalized.length > 1 && normalized.endsWith("/")) {
    return normalized.slice(0, -1);
  }
  return normalized;
}
