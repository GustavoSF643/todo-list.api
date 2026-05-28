export const bearer = (token = "token"): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});
