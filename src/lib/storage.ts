import type { AppState } from '../types';

const KEY = 'buylater:v1';

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can fail (private mode, quota). Losing persistence silently
    // beats crashing the app over it.
  }
}
