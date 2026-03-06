import React, { useState, useEffect } from "react";
import { BarChart2, Settings } from "lucide-react";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { DailyObjective } from "./components/DailyObjective";
import { ClockWeather } from "./components/ClockWeather";
import { SettingsModal, AppSettings } from "./components/SettingsModal";
import { StatsPanel } from "./components/StatsPanel";
import { loadFileAsUrl } from "./components/fileStorage";

const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionCount: 4,
  neonColor: "#00f5ff",
  alarmSoundUrl: null,
  alarmSoundName: null,
  alarmVolume: 0.8,
  backgroundType: "default",
  backgroundUrl: null,
  backgroundName: null,
  weatherCity: "Paris",
  autoMode: false,
};

const SETTINGS_KEY = "pomodoro-app-settings-v2";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(raw),
        backgroundUrl: null,
        alarmSoundUrl: null,
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const restore = async () => {
      const saved = loadSettings();
      if (saved.backgroundType !== "default" && saved.backgroundName) {
        try {
          const url = await loadFileAsUrl("background");
          if (url) setSettings((p) => ({ ...p, backgroundUrl: url }));
        } catch {}
      }
      if (saved.alarmSoundName) {
        try {
          const url = await loadFileAsUrl("alarm");
          if (url) setSettings((p) => ({ ...p, alarmSoundUrl: url }));
        } catch {}
      }
    };
    restore();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...settings, backgroundUrl: null, alarmSoundUrl: null })
    );
  }, [settings]);

  const neon = settings.neonColor;

  return (
    <div
      style={{
        fontFamily: "Orbitron, monospace",
        minHeight: "100dvh",
        overflowY: isMobile ? "auto" : "hidden",
        overflowX: "hidden",
        maxHeight: isMobile ? undefined : "100vh",
        position: "relative",
        width: "100%",
      }}
    >
      {/* ── BACKGROUND ── */}
      {settings.backgroundType === "video" && settings.backgroundUrl ? (
        <video
          className="fixed inset-0 w-full h-full object-cover"
          src={settings.backgroundUrl}
          autoPlay loop muted style={{ zIndex: 0 }}
        />
      ) : settings.backgroundType === "image" && settings.backgroundUrl ? (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: `url(${settings.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
      ) : (
        <div
          className="fixed inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 15% 85%, ${neon}09 0%, transparent 55%),
              radial-gradient(ellipse at 85% 15%, #7b2fff0a 0%, transparent 55%),
              radial-gradient(ellipse at 50% 50%, #180828 0%, #070712 45%, #020208 100%)
            `,
            zIndex: 0,
          }}
        />
      )}

      {settings.backgroundType !== "default" && (
        <div className="fixed inset-0" style={{ background: "rgba(0,0,0,0.52)", zIndex: 1 }} />
      )}

      {/* ── CYBERPUNK GRID ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          backgroundImage: `
            linear-gradient(${neon}05 1px, transparent 1px),
            linear-gradient(90deg, ${neon}05 1px, transparent 1px)
          `,
          backgroundSize: isMobile ? "40px 40px" : "60px 60px",
        }}
      />

      {/* ── SCANLINES ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
        }}
      />

      {/* ── CORNER DECORATIONS (desktop only) ── */}
      {!isMobile && (["tl", "tr", "bl", "br"] as const).map((p) => (
        <CornerDeco key={p} neon={neon} pos={p} />
      ))}

      {/* ════════════════ MOBILE LAYOUT ════════════════ */}
      {isMobile ? (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
          }}
        >
          {/* Sticky top bar */}
          <MobileHeader
            neon={neon}
            onStats={() => setShowStats(true)}
            onSettings={() => setShowSettings(true)}
          />

          {/* Scrollable content */}
          <div
            style={{
              flex: 1,
              padding: "12px 14px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            {/* Timer — compact mode */}
            <PomodoroTimer
              compact
              settings={settings}
              onOpenSettings={() => setShowSettings(true)}
            />

            {/* Daily Objective — full width */}
            <DailyObjective neonColor={neon} width="100%" />

            {/* Clock & Weather — compact horizontal */}
            <ClockWeather
              city={settings.weatherCity}
              neonColor={neon}
              width="100%"
              compact
            />
          </div>
        </div>

      ) : (
        /* ════════════════ DESKTOP LAYOUT ════════════════ */
        <div className="relative" style={{ zIndex: 10 }}>

          {/* TOP-LEFT: Daily Objective */}
          <div className="fixed top-6 left-6">
            <DailyObjective neonColor={neon} />
          </div>

          {/* TOP-RIGHT: Stats button */}
          <div className="fixed top-6 right-6">
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all"
              style={{
                background: "rgba(5,5,20,0.78)",
                border: `1px solid ${neon}35`,
                color: neon,
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 16px ${neon}12`,
                fontFamily: "Orbitron, monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 0 20px ${neon}40, 0 0 40px ${neon}20`;
                el.style.background = `${neon}14`;
                el.style.borderColor = `${neon}70`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 0 16px ${neon}12`;
                el.style.background = "rgba(5,5,20,0.78)";
                el.style.borderColor = `${neon}35`;
              }}
            >
              <BarChart2 size={14} />
              STATS
            </button>
          </div>

          {/* CENTER: Pomodoro Timer */}
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <div style={{ pointerEvents: "all" }}>
              <PomodoroTimer
                settings={settings}
                onOpenSettings={() => setShowSettings(true)}
              />
            </div>
          </div>

          {/* BOTTOM-RIGHT: Clock & Weather */}
          <div className="fixed bottom-6 right-6">
            <ClockWeather city={settings.weatherCity} neonColor={neon} />
          </div>
        </div>
      )}

      {/* ── MODALS / PANELS ── */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showStats && (
        <StatsPanel neon={neon} onClose={() => setShowStats(false)} />
      )}

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: ${neon}40; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${neon}80; }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.4; }
      `}</style>
    </div>
  );
}

/* ── Mobile top bar ── */
function MobileHeader({
  neon,
  onStats,
  onSettings,
}: {
  neon: string;
  onStats: () => void;
  onSettings: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "rgba(4,4,18,0.94)",
        borderBottom: `1px solid ${neon}28`,
        backdropFilter: "blur(14px)",
        boxShadow: `0 2px 20px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Stats button */}
      <button
        onClick={onStats}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: neon,
          background: `${neon}12`,
          border: `1px solid ${neon}35`,
          borderRadius: 8,
          padding: "6px 12px",
          fontFamily: "Orbitron, monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          boxShadow: `0 0 10px ${neon}18`,
        }}
      >
        <BarChart2 size={13} />
        STATS
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: neon,
            boxShadow: `0 0 8px ${neon}, 0 0 16px ${neon}`,
          }}
        />
        <span
          style={{
            color: neon,
            fontSize: 12,
            letterSpacing: "0.22em",
            textShadow: `0 0 12px ${neon}80`,
          }}
        >
          POMODORO
        </span>
      </div>

      {/* Settings button */}
      <button
        onClick={onSettings}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          color: neon,
          background: `${neon}12`,
          border: `1px solid ${neon}35`,
          borderRadius: 8,
          boxShadow: `0 0 10px ${neon}18`,
        }}
      >
        <Settings size={16} />
      </button>
    </div>
  );
}

/* ── Corner bracket decorations (desktop only) ── */
function CornerDeco({ neon, pos }: { neon: string; pos: "tl" | "tr" | "bl" | "br" }) {
  const isTop  = pos.startsWith("t");
  const isLeft = pos.endsWith("l");
  const S = 56, L = 28;
  const ax = isLeft ? 0 : S;
  const ay = isTop  ? 0 : S;

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        top:    isTop  ? 0 : undefined,
        bottom: !isTop ? 0 : undefined,
        left:   isLeft ? 0 : undefined,
        right:  !isLeft ? 0 : undefined,
        width: S, height: S,
        zIndex: 4,
      }}
    >
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} fill="none">
        <line x1={ax} y1={ay} x2={isLeft ? ax + L : ax - L} y2={ay} stroke={neon} strokeWidth="1.5" opacity="0.55" />
        <line x1={ax} y1={ay} x2={ax} y2={isTop ? ay + L : ay - L} stroke={neon} strokeWidth="1.5" opacity="0.55" />
        <circle cx={ax} cy={ay} r={2.5} fill={neon} style={{ filter: `drop-shadow(0 0 5px ${neon})` }} />
      </svg>
    </div>
  );
}
