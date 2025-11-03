export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const user = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    
    return user.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}