import React, { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, BarChart2, Zap, TrendingUp } from "lucide-react";
import {
  loadStats,
  getTodayTime,
  getWeekTime,
  getMonthTime,
  getTotalTime,
  getCurrentLevel,
  getNextLevel,
  getLevelProgress,
  formatDuration,
  getDateKey,
  LEVELS,
} from "./statsStorage";

interface StatsPanelProps {
  neon: string;
  onClose: () => void;
}

const MONTH_NAMES = ["JANV", "FÉVR", "MARS", "AVRI", "MAI", "JUIN",
  "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
const DAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"];

export function StatsPanel({ neon, onClose }: StatsPanelProps) {
  const [calDate, setCalDate] = useState(() => new Date());
  const stats = useMemo(() => loadStats(), []);

  const todayTime  = getTodayTime(stats);
  const weekTime   = getWeekTime(stats);
  const monthTime  = getMonthTime(stats);
  const totalTime  = getTotalTime(stats);

  const currentLvl  = getCurrentLevel(totalTime);
  const nextLvl     = getNextLevel(totalTime);
  const lvlProgress = getLevelProgress(totalTime);

  const year  = calDate.getFullYear();
  const month = calDate.getMonth();

  // Calendar grid (Mon-first)
  const firstDow = (() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = getDateKey();
  const getDayKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const getDaySecs = (d: number) => stats[getDayKey(d)] || 0;

  const weeks: { days: (number | null)[]; total: number }[] = [];
  for (let r = 0; r < cells.length / 7; r++) {
    const slice = cells.slice(r * 7, r * 7 + 7);
    const total = slice.reduce((s, d) => s + (d ? getDaySecs(d) : 0), 0);
    weeks.push({ days: slice, total });
  }

  // Max seconds in month for relative intensity
  const maxDay = Math.max(1, ...cells.filter(Boolean).map((d) => getDaySecs(d as number)));

  const getDayBg = (secs: number) => {
    if (secs === 0) return "rgba(255,255,255,0.04)";
    const ratio = secs / maxDay;
    const op = Math.floor((0.15 + ratio * 0.85) * 255).toString(16).padStart(2, "0");
    return `${neon}${op}`;
  };
  const getDayGlow = (secs: number) => {
    if (secs === 0) return "none";
    const ratio = secs / maxDay;
    return `0 0 ${4 + ratio * 10}px ${neon}90`;
  };

  const prevMonth = () => setCalDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 200 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative overflow-y-auto rounded-xl"
        style={{
          width: 580,
          maxHeight: "92vh",
          background: "linear-gradient(160deg, rgba(4,4,20,0.98) 0%, rgba(6,6,24,0.98) 100%)",
          border: `1px solid ${neon}35`,
          boxShadow: `0 0 60px ${neon}14, 0 0 120px ${neon}08, inset 0 0 60px rgba(0,0,0,0.4)`,
          fontFamily: "Orbitron, monospace",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: "rgba(4,4,20,0.99)", borderBottom: `1px solid ${neon}22` }}
        >
          <div className="flex items-center gap-3">
            <BarChart2 size={16} style={{ color: neon }} />
            <span style={{ color: neon, fontSize: 13, letterSpacing: "0.2em" }}>STATISTIQUES</span>
          </div>
          <CloseBtn neon={neon} onClick={onClose} />
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* ── LEVEL CARD ── */}
          <div
            className="rounded-xl p-5"
            style={{
              background: `linear-gradient(135deg, ${currentLvl.color}08 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${currentLvl.color}30`,
              boxShadow: `0 0 20px ${currentLvl.color}10`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} style={{ color: currentLvl.color }} />
              <span style={{ color: currentLvl.color, fontSize: 11, letterSpacing: "0.2em" }}>
                NIVEAU & XP
              </span>
            </div>

            <div className="flex items-end justify-between mb-4">
              <div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: currentLvl.color,
                    lineHeight: 1,
                    textShadow: `0 0 20px ${currentLvl.color}80`,
                    fontFamily: "Orbitron, monospace",
                  }}
                >
                  LVL {currentLvl.level}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: currentLvl.color,
                    letterSpacing: "0.25em",
                    marginTop: 4,
                    opacity: 0.85,
                  }}
                >
                  {currentLvl.label}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>
                  TEMPS TOTAL
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: "white",
                    fontFamily: "Share Tech Mono, monospace",
                    marginTop: 4,
                  }}
                >
                  {formatDuration(totalTime)}
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
                  LVL {currentLvl.level}
                </span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
                  {nextLvl ? `LVL ${nextLvl.level} — ${nextLvl.minHours}h` : "NIVEAU MAX"}
                </span>
              </div>
              <div
                className="rounded-full overflow-hidden"
                style={{ height: 8, background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${lvlProgress}%`,
                    background: currentLvl.color,
                    boxShadow: `0 0 10px ${currentLvl.color}, 0 0 20px ${currentLvl.color}60`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
              {nextLvl && totalTime > 0 && (
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.25)",
                    marginTop: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  Encore {formatDuration(nextLvl.minHours * 3600 - totalTime)} pour atteindre {nextLvl.label}
                </div>
              )}
            </div>
          </div>

          {/* ── TIME STATS GRID ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "AUJOURD'HUI", value: todayTime },
              { label: "CETTE SEMAINE", value: weekTime },
              { label: "CE MOIS", value: monthTime },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-4 flex flex-col items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid ${neon}18`,
                  boxShadow: value > 0 ? `0 0 12px ${neon}08` : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.12em",
                    textAlign: "center",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: value > 0 ? 26 : 20,
                    fontWeight: 700,
                    color: value > 0 ? "white" : "rgba(255,255,255,0.2)",
                    lineHeight: 1,
                    textShadow: value > 0 ? `0 0 20px rgba(255,255,255,0.15)` : "none",
                    fontFamily: "Orbitron, monospace",
                  }}
                >
                  {value > 0 ? formatDuration(value) : "—"}
                </div>
              </div>
            ))}
          </div>

          {/* ── CALENDAR HEATMAP ── */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${neon}18` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} style={{ color: neon }} />
                <span style={{ color: neon, fontSize: 11, letterSpacing: "0.2em" }}>
                  CALENDRIER
                </span>
              </div>
              <div className="flex items-center gap-2">
                <NavBtn neon={neon} onClick={prevMonth}><ChevronLeft size={13} /></NavBtn>
                <span style={{ color: "white", fontSize: 11, letterSpacing: "0.1em", minWidth: 90, textAlign: "center" }}>
                  {MONTH_NAMES[month]} {year}
                </span>
                <NavBtn neon={neon} onClick={nextMonth}><ChevronRight size={13} /></NavBtn>
              </div>
            </div>

            {/* Day headers + TOT column */}
            <div
              className="grid gap-1 mb-1.5"
              style={{ gridTemplateColumns: "repeat(7, 1fr) 62px" }}
            >
              {DAY_NAMES.map((d, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {d}
                </div>
              ))}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                TOT
              </div>
            </div>

            {/* Calendar rows */}
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="grid gap-1 mb-1"
                style={{ gridTemplateColumns: "repeat(7, 1fr) 62px" }}
              >
                {week.days.map((d, di) => {
                  if (d === null) {
                    return <div key={di} style={{ aspectRatio: "1", borderRadius: 4 }} />;
                  }
                  const secs = getDaySecs(d);
                  const isToday = getDayKey(d) === todayKey;
                  return (
                    <div
                      key={di}
                      title={secs > 0 ? `${getDayKey(d)}: ${formatDuration(secs)}` : getDayKey(d)}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 4,
                        background: getDayBg(secs),
                        boxShadow: isToday
                          ? `0 0 0 1.5px white, ${getDayGlow(secs)}`
                          : getDayGlow(secs),
                        border: isToday ? "none" : `1px solid ${secs > 0 ? neon + "30" : "rgba(255,255,255,0.05)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "default",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          color: secs > 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
                          fontFamily: "Share Tech Mono, monospace",
                        }}
                      >
                        {d}
                      </span>
                    </div>
                  );
                })}

                {/* Weekly total */}
                <div
                  style={{
                    borderRadius: 4,
                    background: week.total > 0 ? `${neon}12` : "transparent",
                    border: week.total > 0 ? `1px solid ${neon}25` : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: week.total > 0 ? neon : "rgba(255,255,255,0.12)",
                      fontFamily: "Share Tech Mono, monospace",
                      textShadow: week.total > 0 ? `0 0 8px ${neon}80` : "none",
                    }}
                  >
                    {week.total > 0 ? formatDuration(week.total) : "—"}
                  </span>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3">
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>MOINS</span>
              {[0, 0.2, 0.45, 0.7, 1].map((ratio, i) => (
                <div
                  key={i}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 3,
                    background:
                      ratio === 0
                        ? "rgba(255,255,255,0.04)"
                        : `${neon}${Math.floor(ratio * 255).toString(16).padStart(2, "0")}`,
                    boxShadow: ratio > 0.5 ? `0 0 5px ${neon}80` : "none",
                  }}
                />
              ))}
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>PLUS</span>
            </div>
          </div>

          {/* ── LEVELS TABLE ── */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${neon}18` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} style={{ color: neon }} />
              <span style={{ color: neon, fontSize: 10, letterSpacing: "0.2em" }}>PROGRESSION</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {LEVELS.map((lvl) => {
                const unlocked = totalTime / 3600 >= lvl.minHours;
                const isActive = currentLvl.level === lvl.level;
                return (
                  <div
                    key={lvl.level}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{
                      background: isActive ? `${lvl.color}12` : "transparent",
                      border: isActive
                        ? `1px solid ${lvl.color}35`
                        : "1px solid rgba(255,255,255,0.04)",
                      boxShadow: isActive ? `0 0 12px ${lvl.color}15` : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: unlocked ? lvl.color : "rgba(255,255,255,0.1)",
                          boxShadow: unlocked ? `0 0 6px ${lvl.color}` : "none",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: unlocked ? lvl.color : "rgba(255,255,255,0.2)",
                          fontWeight: isActive ? 700 : 400,
                          letterSpacing: "0.05em",
                        }}
                      >
                        LVL {lvl.level}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: unlocked ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.2)",
                          letterSpacing: "0.15em",
                        }}
                      >
                        {lvl.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span style={{ fontSize: 9, color: lvl.color }}>◀ ACTIF</span>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          color: unlocked ? lvl.color : "rgba(255,255,255,0.2)",
                          fontFamily: "Share Tech Mono, monospace",
                        }}
                      >
                        {lvl.minHours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseBtn({ neon, onClick }: { neon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full transition-all"
      style={{ width: 32, height: 32, border: `1px solid ${neon}40`, color: neon }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `${neon}20`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${neon}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <X size={16} />
    </button>
  );
}

function NavBtn({
  neon, onClick, children,
}: { neon: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded transition-all"
      style={{ width: 26, height: 26, border: `1px solid ${neon}30`, color: neon }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `${neon}20`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${neon}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}