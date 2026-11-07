const STORAGE_KEY = "barca-brain:ask-code";

// Storage can be blocked. The code then just needs entering again next visit.
export function readAccessCode(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveAccessCode(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Kept in memory for this visit.
  }
}
