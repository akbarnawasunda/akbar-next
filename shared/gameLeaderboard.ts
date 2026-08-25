export const LEADERBOARD_LIMIT = 10;
export const LEADERBOARD_MAX_SCORE = 999_999;
export const LEADERBOARD_USERNAME_MIN = 2;
export const LEADERBOARD_USERNAME_MAX = 20;

const allowedUsernamePattern = /^[\p{L}\p{N} _-]+$/u;

export function normalizeLeaderboardUsername(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < LEADERBOARD_USERNAME_MIN) {
    return { value: "", error: "Username minimal 2 karakter." };
  }
  if (normalized.length > LEADERBOARD_USERNAME_MAX) {
    return { value: "", error: `Username maksimal ${LEADERBOARD_USERNAME_MAX} karakter.` };
  }
  if (!allowedUsernamePattern.test(normalized)) {
    return { value: "", error: "Username hanya boleh berisi huruf, angka, spasi, garis bawah, atau tanda hubung." };
  }
  if (normalized.includes("@") || normalized.includes("//") || normalized.includes("..")) {
    return { value: "", error: "Gunakan username publik, bukan email atau URL." };
  }
  return { value: normalized, error: "" };
}

export function normalizeLeaderboardScore(value: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) return null;
  if (value > LEADERBOARD_MAX_SCORE) return null;
  return value;
}
