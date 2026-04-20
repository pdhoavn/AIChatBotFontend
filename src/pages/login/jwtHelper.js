export function getRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
 
    const claim =
      payload.role ||
      payload.roles ||
      payload.authorities ||
      payload.auth ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (Array.isArray(claim)) return claim[0] || null;
    if (typeof claim === "string") return claim;
    if (Array.isArray(payload?.auth)) return payload.auth[0]?.authority || null;
    return null;
  } catch {
    return null;
  }
}
