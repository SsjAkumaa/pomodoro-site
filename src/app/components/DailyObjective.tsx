import React, { useState, useEffect, useRef } from "react";
import { Target, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface DailyObjectiveProps {
  neonColor: string;
  /** Override container width (number = px, string = any CSS value) */
  width?: number | string;
}

interface ObjectiveSettings {
  startTime: string;
  endTime: string;
  resetAt: number | null;
}

const STORAGE_KEY = "daily-objective-settings";

const DEFAULT: ObjectiveSettings = {
  startTime: "09:00",
  endTime: "18:00",
  resetAt: null,
};

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function DailyObjective({ neonColor, width }: DailyObjectiveProps) {
  const neon = neonColor;

  const [obj, setObj] = useState<ObjectiveSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
  });
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);
  const [editStart, setEditStart] = useState(obj.startTime);
  const [editEnd, setEditEnd] = useState(obj.endTime);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }, [obj]);

  const getProgress = (): number => {
    const startMin = parseTimeToMinutes(obj.startTime);
    const endMin = parseTimeToMinutes(obj.endTime);
    const totalDuration = (endMin - startMin) * 60 * 1000;
    if (totalDuration <= 0) return 0;

    let elapsed: number;
    if (obj.resetAt !== null) {
      elapsed = now - obj.resetAt;
    } else {
      const todayStart = new Date();
      todayStart.setHours(startMin / 60 | 0, startMin % 60, 0, 0);
      elapsed = now - todayStart.getTime();
    }
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const progress = getProgress();
  const isActive = progress > 0 && progress < 100;

  const handleReset = () => {
    setObj((prev) => ({ ...prev, resetAt: Date.now() }));
  };

  const handleApply = () => {
    setObj((prev) => ({
      ...prev,
      startTime: editStart,
      endTime: editEnd,
      resetAt: null,
    }));
    setExpanded(false);
  };

  const progressColor = progress >= 100 ? "#00ff88" : neon;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        width: width ?? 280,
        background: "rgba(5,5,20,0.78)",
        border: `1px solid ${neon}50`,
        backdropFilter: "blur(12px)",
        boxShadow: `0 0 12px ${neon}40, 0 0 28px ${neon}1c, 0 0 56px ${neon}0a, inset 0 0 24px rgba(0,0,0,0.3)`,
        fontFamily: "Orbitron, monospace",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${neon}20` }}
      >
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: neon }} />
          <span style={{ color: neon, fontSize: 10, letterSpacing: "0.2em" }}>
            OBJECTIF QUOTIDIEN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center justify-center rounded transition-all"
            style={{
              width: 24, height: 24,
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            title="Remettre à zéro"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = neon;
              (e.currentTarget as HTMLElement).style.borderColor = `${neon}60`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${neon}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center rounded transition-all"
            style={{
              width: 24, height: 24,
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            title="Paramètres"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = neon;
              (e.currentTarget as HTMLElement).style.borderColor = `${neon}60`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Progress section */}
      <div className="px-4 py-4">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: progress >= 100 ? "#00ff88" : "white",
                lineHeight: 1,
                textShadow: progress >= 100 ? `0 0 20px #00ff88` : "none",
                fontFamily: "Orbitron, monospace",
              }}
            >
              {Math.round(progress)}%
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginTop: 4 }}>
              {progress >= 100 ? "OBJECTIF ATTEINT !" : isActive ? "EN COURS..." : "EN ATTENTE"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
              {obj.startTime} → {obj.endTime}
            </div>
            {obj.resetAt && (
              <div style={{ fontSize: 9, color: `${neon}80`, letterSpacing: "0.05em" }}>
                ↺ RÉINITIALISÉ
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            height: 6,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: progressColor,
              boxShadow: `0 0 8px ${progressColor}, 0 0 16px ${progressColor}60`,
            }}
          />
          {/* Scanline on bar */}
          {isActive && (
            <div
              className="absolute inset-y-0 w-4 rounded-full"
              style={{
                right: `${100 - progress}%`,
                background: `linear-gradient(90deg, transparent, ${progressColor}80, transparent)`,
                animation: "scanBar 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>

        {/* Time indicators */}
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            START
          </span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            END
          </span>
        </div>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div
          className="px-4 pb-4 flex flex-col gap-3"
          style={{ borderTop: `1px solid ${neon}20` }}
        >
          <div style={{ height: 12 }} />
          <div className="flex items-center justify-between">
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.1em" }}>
              DÉBUT
            </span>
            <input
              type="time"
              value={editStart}
              onChange={(e) => setEditStart(e.target.value)}
              className="rounded px-2 py-1 outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${neon}40`,
                color: "white",
                fontSize: 11,
                fontFamily: "Share Tech Mono, monospace",
                colorScheme: "dark",
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.1em" }}>
              FIN
            </span>
            <input
              type="time"
              value={editEnd}
              onChange={(e) => setEditEnd(e.target.value)}
              className="rounded px-2 py-1 outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${neon}40`,
                color: "white",
                fontSize: 11,
                fontFamily: "Share Tech Mono, monospace",
                colorScheme: "dark",
              }}
            />
          </div>
          <button
            onClick={handleApply}
            className="w-full py-2 rounded transition-all"
            style={{
              background: `${neon}20`,
              border: `1px solid ${neon}50`,
              color: neon,
              fontSize: 10,
              letterSpacing: "0.2em",
              fontFamily: "Orbitron, monospace",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${neon}35`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${neon}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${neon}20`;
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            APPLIQUER
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanBar {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}