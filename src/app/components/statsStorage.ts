const STATS_KEY = "pomodoro-stats-v1";

export interface DayStats {
  [date: string]: number; // seconds worked
}

export interface LevelInfo {
  level: number;
  label: string;
  minHours: number;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 0, label: "DÉBUTANT",  minHours: 0,   color: "#666688" },
  { level: 1, label: "INITIÉ",    minHours: 1,   color: "#00f5ff" },
  { level: 2, label: "APPRENTI",  minHours: 5,   color: "#00ff88" },
  { level: 3, label: "CONFIRMÉ",  minHours: 10,  color: "#ff9500" },
  { level: 4, label: "EXPERT",    minHours: 25,  color: "#ff006e" },
  { level: 5, label: "MAÎTRE",    minHours: 50,  color: "#7b2fff" },
  { level: 6, label: "LÉGENDE",   minHours: 100, color: "#ffffff" },
];

export function loadStats(): DayStats {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStats(stats: DayStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addFocusTime(seconds: number): void {
  if (seconds <= 0) return;
  const stats = loadStats();
  const today = getDateKey();
  stats[today] = (stats[today] || 0) + Math.round(seconds);
  saveStats(stats);
}

export function getTotalTime(stats: DayStats): number {
  return Object.values(stats).reduce((s, v) => s + v, 0);
}

export function getTodayTime(stats: DayStats): number {
  return stats[getDateKey()] || 0;
}

export function getWeekTime(stats: DayStats): number {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  const mondayKey = getDateKey(monday);
  return Object.entries(stats).reduce((s, [d, v]) => (d >= mondayKey ? s + v : s), 0);
}

export function getMonthTime(stats: DayStats): number {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
  return Object.entries(stats).reduce((s, [d, v]) => (d.startsWith(prefix) ? s + v : s), 0);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

export function getCurrentLevel(totalSeconds: number): LevelInfo {
  const hours = totalSeconds / 3600;
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (hours >= lvl.minHours) current = lvl;
    else break;
  }
  return current;
}

export function getNextLevel(totalSeconds: number): LevelInfo | null {
  const hours = totalSeconds / 3600;
  for (const lvl of LEVELS) {
    if (hours < lvl.minHours) return lvl;
  }
  return null;
}

export function getLevelProgress(totalSeconds: number): number {
  const hours = totalSeconds / 3600;
  const current = getCurrentLevel(totalSeconds);
  const next = getNextLevel(totalSeconds);
  if (!next) return 100;
  return Math.min(100, ((hours - current.minHours) / (next.minHours - current.minHours)) * 100);
}
