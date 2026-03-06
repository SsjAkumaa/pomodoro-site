import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings, RotateCcw, SkipForward, Play, Pause, Zap } from "lucide-react";
import { AppSettings } from "./SettingsModal";
import { addFocusTime } from "./statsStorage";

interface PomodoroTimerProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  /** Compact mode for mobile: smaller SVG, hidden gear button */
  compact?: boolean;
}

type Mode = "focus" | "short" | "long";

const MODE_LABELS: Record<Mode, string> = {
  focus: "Focus",
  short: "Pause courte",
  long:  "Pause longue",
};

// Mobile-friendly shorter labels
const MODE_LABELS_SHORT: Record<Mode, string> = {
  focus: "Focus",
  short: "Courte",
  long:  "Longue",
};

// Fixed internal SVG coordinate space — never changes
const SVG_VBOX  = 280;
const CX        = SVG_VBOX / 2;   // 140
const CY        = SVG_VBOX / 2;   // 140
const RADIUS    = 118;
const STROKE_W  = 8;
const CIRCUM    = 2 * Math.PI * RADIUS;

const AUTO_DELAY = 1800;

function playDefaultBeep(volume: number) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const vol = Math.max(0, Math.min(1, volume));
    [0, 0.42, 0.84].forEach((delay) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + delay + 0.3);
      gain.gain.setValueAtTime(0.6 * vol, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    });
  } catch {}
}

export function PomodoroTimer({ settings, onOpenSettings, compact = false }: PomodoroTimerProps) {
  const neon = settings.neonColor;

  // ── Responsive display size ──
  // The SVG viewBox is always "0 0 280 280" so all coordinates are identical.
  // We just render it at a smaller physical pixel size on mobile.
  const displaySize = compact ? 234 : 280;
  const scale       = displaySize / SVG_VBOX; // for scaling pixel offsets (e.g. glow div)

  const [mode, setMode]                           = useState<Mode>("focus");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isRunning, setIsRunning]                 = useState(false);
  const [timeLeft, setTimeLeft]                   = useState(settings.focusDuration * 60);

  const startTimestampRef = useRef<number | null>(null);
  const baseTimeLeftRef   = useRef<number>(settings.focusDuration * 60);
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef          = useRef<HTMLAudioElement | null>(null);

  const latestRef = useRef({ mode, completedSessions, settings, isRunning });
  useEffect(() => { latestRef.current = { mode, completedSessions, settings, isRunning }; });

  const getDuration = useCallback((m: Mode, s?: AppSettings): number => {
    const cfg = s ?? latestRef.current.settings;
    if (m === "focus") return cfg.focusDuration * 60;
    if (m === "short") return cfg.shortBreakDuration * 60;
    return cfg.longBreakDuration * 60;
  }, []);

  const computeTimeLeft = useCallback((): number => {
    if (startTimestampRef.current === null) return baseTimeLeftRef.current;
    const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
    return Math.max(0, baseTimeLeftRef.current - elapsed);
  }, []);

  const playAlarm = useCallback(() => {
    const { settings: s } = latestRef.current;
    if (s.alarmSoundUrl) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      const audio = new Audio(s.alarmSoundUrl);
      audio.volume = Math.max(0, Math.min(1, s.alarmVolume));
      audio.play().catch(() => playDefaultBeep(s.alarmVolume));
      audioRef.current = audio;
    } else {
      playDefaultBeep(s.alarmVolume);
    }
  }, []);

  const advanceAfterSession = useCallback(() => {
    const { mode: m, completedSessions: cs, settings: s } = latestRef.current;
    if (m === "focus") {
      const newCs = cs + 1;
      setCompletedSessions(newCs);
      if (newCs % s.sessionCount === 0) {
        const dur = getDuration("long", s);
        setMode("long"); setTimeLeft(dur); baseTimeLeftRef.current = dur;
      } else {
        const dur = getDuration("short", s);
        setMode("short"); setTimeLeft(dur); baseTimeLeftRef.current = dur;
      }
    } else {
      const dur = getDuration("focus", s);
      setMode("focus"); setTimeLeft(dur); baseTimeLeftRef.current = dur;
    }
  }, [getDuration]);

  /* ── Core timer ── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isRunning) {
      startTimestampRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const current = computeTimeLeft();
        setTimeLeft(current);
        if (current === 0) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          startTimestampRef.current = null;
          setTimeout(() => {
            playAlarm();
            if (latestRef.current.mode === "focus")
              addFocusTime(latestRef.current.settings.focusDuration * 60);
            advanceAfterSession();
            if (latestRef.current.settings.autoMode)
              setTimeout(() => setIsRunning(true), AUTO_DELAY);
          }, 50);
        }
      }, 200);
    } else {
      if (startTimestampRef.current !== null) {
        baseTimeLeftRef.current = computeTimeLeft();
        startTimestampRef.current = null;
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, computeTimeLeft, playAlarm, advanceAfterSession]);

  /* ── Visibility change ── */
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden || !latestRef.current.isRunning || startTimestampRef.current === null) return;
      const current = computeTimeLeft();
      setTimeLeft(current);
      if (current === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        startTimestampRef.current = null;
        playAlarm();
        if (latestRef.current.mode === "focus")
          addFocusTime(latestRef.current.settings.focusDuration * 60);
        advanceAfterSession();
        if (latestRef.current.settings.autoMode)
          setTimeout(() => setIsRunning(true), AUTO_DELAY);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /* ── Duration change while paused ── */
  const prevDurRef = useRef({ focus: settings.focusDuration, short: settings.shortBreakDuration, long: settings.longBreakDuration });
  useEffect(() => {
    const changed =
      prevDurRef.current.focus !== settings.focusDuration ||
      prevDurRef.current.short !== settings.shortBreakDuration ||
      prevDurRef.current.long  !== settings.longBreakDuration;
    if (changed && !isRunning) {
      const dur = getDuration(mode, settings);
      setTimeLeft(dur);
      baseTimeLeftRef.current = dur;
    }
    prevDurRef.current = { focus: settings.focusDuration, short: settings.shortBreakDuration, long: settings.longBreakDuration };
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  /* ── Controls ── */
  const handleModeChange = (m: Mode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimestampRef.current = null;
    setIsRunning(false); setMode(m);
    const dur = getDuration(m, settings);
    setTimeLeft(dur); baseTimeLeftRef.current = dur;
  };
  const handlePlayPause = () => setIsRunning((v) => !v);
  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimestampRef.current = null;
    setIsRunning(false);
    const dur = getDuration(mode, settings);
    setTimeLeft(dur); baseTimeLeftRef.current = dur;
  };
  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (latestRef.current.mode === "focus") {
      const elapsed = getDuration("focus", latestRef.current.settings) - computeTimeLeft();
      if (elapsed > 0) addFocusTime(elapsed);
    }
    startTimestampRef.current = null;
    setIsRunning(false);
    playAlarm();
    advanceAfterSession();
  };

  /* ── Derived values ── */
  const totalDuration = getDuration(mode, settings);
  const progress      = totalDuration > 0 ? timeLeft / totalDuration : 1;
  const dashOffset    = CIRCUM * (1 - progress);

  const minutes     = Math.floor(timeLeft / 60);
  const seconds     = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const filledDots  = completedSessions % settings.sessionCount;

  // Trailing dot at arc's consuming end (correct formula: -90 + progress*360)
  const trailRad = (-90 + progress * 360) * (Math.PI / 180);
  const dotX     = CX + RADIUS * Math.cos(trailRad);
  const dotY     = CY + RADIUS * Math.sin(trailRad);
  const leadX    = CX;
  const leadY    = CY - RADIUS;

  // Sizes that adapt between compact and full
  const tabPx    = compact ? "px-3 py-1.5" : "px-5 py-1.5";
  const tabFs    = compact ? 10 : 11;
  const timeFontSize = compact ? 46 : 58;
  const rootGap  = compact ? 14 : 24;
  const ctrlGap  = compact ? 20 : 28;
  const dotSize  = compact ? 7 : 9;
  const playBtnSize = compact ? 60 : 68;
  const ctrlBtnSize = compact ? 42 : 46;
  const labels   = compact ? MODE_LABELS_SHORT : MODE_LABELS;

  return (
    <div
      className="flex flex-col items-center select-none"
      style={{ gap: rootGap }}
    >
      {/* ── Mode tabs ── */}
      <div
        className="flex items-center gap-1 p-1 rounded-full"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: `1px solid ${neon}35`,
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        {(["focus", "short", "long"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`${tabPx} rounded-full transition-all`}
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: tabFs,
              letterSpacing: "0.05em",
              color: mode === m ? "#000" : "rgba(255,255,255,0.45)",
              background: mode === m ? neon : "transparent",
              boxShadow: mode === m ? `0 0 12px ${neon}, 0 0 28px ${neon}70, 0 0 48px ${neon}30` : "none",
              fontWeight: mode === m ? 700 : 400,
              transition: "all 0.25s ease",
            }}
          >
            {labels[m]}
          </button>
        ))}
      </div>

      {/* ── Circle + optional Gear ── */}
      <div className="relative flex items-center justify-center">

        {/* Gear button — desktop only (hidden when compact) */}
        {!compact && (
          <button
            onClick={onOpenSettings}
            title="Paramètres"
            className="absolute flex items-center justify-center rounded-full transition-all"
            style={{
              right: -58, top: "50%", transform: "translateY(-50%)",
              width: 42, height: 42,
              background: "rgba(5,5,20,0.85)",
              border: `1px solid ${neon}45`,
              color: neon,
              boxShadow: `0 0 10px ${neon}25`,
              backdropFilter: "blur(8px)",
              zIndex: 10,
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 18px ${neon}, 0 0 36px ${neon}55`; el.style.background = `${neon}18`; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 10px ${neon}25`; el.style.background = "rgba(5,5,20,0.85)"; }}
          >
            <Settings size={18} />
          </button>
        )}

        {/* SVG container — rendered at displaySize but internally uses 280 viewBox */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: displaySize, height: displaySize }}
        >
          {/* Ambient radial glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width:  (RADIUS * 2 + 60) * scale,
              height: (RADIUS * 2 + 60) * scale,
              background: `radial-gradient(circle, ${neon}${isRunning ? "0d" : "06"} 0%, transparent 70%)`,
              transition: "background 1s ease",
            }}
          />

          <svg
            width={displaySize}
            height={displaySize}
            viewBox={`0 0 ${SVG_VBOX} ${SVG_VBOX}`}
            style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
          >
            <defs>
              <filter id="neonGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3"  result="b1" />
                <feGaussianBlur stdDeviation="7"  result="b2" />
                <feGaussianBlur stdDeviation="14" result="b3" />
                <feMerge>
                  <feMergeNode in="b3" /><feMergeNode in="b2" />
                  <feMergeNode in="b1" /><feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" /><feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="dotGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="5"  result="b1" />
                <feGaussianBlur stdDeviation="10" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" /><feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background panel */}
            <circle cx={CX} cy={CY} r={RADIUS + STROKE_W + 8} fill="rgba(4,4,18,0.92)" />
            <circle cx={CX} cy={CY} r={RADIUS - 18} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={STROKE_W} />

            {/* Spinning arc group */}
            <g
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                animation: "timerSpin 12s linear infinite",
                animationPlayState: isRunning ? "running" : "paused",
              }}
            >
              {/* Main neon arc */}
              <circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none" stroke={neon}
                strokeWidth={STROKE_W}
                strokeLinecap="round"
                strokeDasharray={CIRCUM}
                transform={`rotate(-90, ${CX}, ${CY})`}
                filter="url(#neonGlow)"
                style={{
                  strokeDashoffset: dashOffset,
                  transition: isRunning ? "stroke-dashoffset 0.22s linear" : "stroke-dashoffset 0.12s ease",
                }}
              />
              {/* Thin bright shimmer arc */}
              <circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none" stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={CIRCUM}
                transform={`rotate(-90, ${CX}, ${CY})`}
                filter="url(#softGlow)"
                opacity={0.28}
                style={{
                  strokeDashoffset: dashOffset,
                  transition: isRunning ? "stroke-dashoffset 0.22s linear" : "stroke-dashoffset 0.12s ease",
                }}
              />
              {/* Trailing dot */}
              {progress > 0.01 && progress < 0.995 && (
                <circle cx={dotX} cy={dotY} r={STROKE_W / 2 + 2.5} fill={neon} filter="url(#dotGlow)" />
              )}
              {/* Leading dot */}
              {progress > 0.01 && (
                <circle cx={leadX} cy={leadY} r={STROKE_W / 2 + 1} fill="white" opacity={0.7} filter="url(#softGlow)" />
              )}
            </g>
          </svg>

          {/* Center content — does NOT spin */}
          <div className="relative flex flex-col items-center justify-center gap-3">
            {/* Session dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: settings.sessionCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width:  i < filledDots ? dotSize : dotSize - 3,
                    height: i < filledDots ? dotSize : dotSize - 3,
                    borderRadius: "50%",
                    background: i < filledDots ? neon : "rgba(255,255,255,0.2)",
                    boxShadow: i < filledDots ? `0 0 6px ${neon}, 0 0 14px ${neon}90` : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* Time */}
            <div
              style={{
                fontFamily: "Orbitron, monospace",
                fontSize: timeFontSize,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                textShadow: "0 0 30px rgba(255,255,255,0.2)",
                minWidth: compact ? 132 : 165,
                textAlign: "center",
              }}
            >
              {timeDisplay}
            </div>

            {/* Mode label + AUTO badge */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: neon,
                    boxShadow: `0 0 6px ${neon}, 0 0 14px ${neon}`,
                    animation: isRunning ? "dotBlink 1.5s ease-in-out infinite" : "none",
                  }}
                />
                <span style={{ fontFamily: "Orbitron, monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)" }}>
                  {MODE_LABELS[mode].toUpperCase()} {filledDots}/{settings.sessionCount}
                </span>
              </div>
              {settings.autoMode && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: `${neon}18`, border: `1px solid ${neon}45`, boxShadow: `0 0 8px ${neon}30` }}
                >
                  <Zap size={9} style={{ color: neon }} />
                  <span style={{ fontFamily: "Orbitron, monospace", fontSize: 8, letterSpacing: "0.2em", color: neon }}>AUTO</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center" style={{ gap: ctrlGap }}>
        <ControlBtn onClick={handleReset} neon={neon} title="Réinitialiser" size={ctrlBtnSize}>
          <RotateCcw size={compact ? 16 : 18} />
        </ControlBtn>

        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{
            width: playBtnSize, height: playBtnSize,
            background: neon, color: "#000",
            border: "none",
            boxShadow: `0 0 16px ${neon}, 0 0 36px ${neon}80, 0 0 56px ${neon}35`,
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1.07)"; el.style.boxShadow = `0 0 24px ${neon}, 0 0 56px ${neon}, 0 0 80px ${neon}50`; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1)"; el.style.boxShadow = `0 0 16px ${neon}, 0 0 36px ${neon}80, 0 0 56px ${neon}35`; }}
        >
          {isRunning ? <Pause size={compact ? 24 : 28} /> : <Play size={compact ? 24 : 28} style={{ marginLeft: 3 }} />}
        </button>

        <ControlBtn onClick={handleSkip} neon={neon} title="Session suivante" size={ctrlBtnSize}>
          <SkipForward size={compact ? 16 : 18} />
        </ControlBtn>
      </div>

      <style>{`
        @keyframes timerSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.65); }
        }
      `}</style>
    </div>
  );
}

function ControlBtn({
  onClick, neon, title, children, size = 46,
}: {
  onClick: () => void; neon: string; title?: string; children: React.ReactNode; size?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center rounded-full transition-all"
      style={{ width: size, height: size, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)" }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = neon; el.style.borderColor = `${neon}65`; el.style.boxShadow = `0 0 14px ${neon}45`; el.style.background = `${neon}10`; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.55)"; el.style.borderColor = "rgba(255,255,255,0.13)"; el.style.boxShadow = "none"; el.style.background = "rgba(255,255,255,0.04)"; }}
    >
      {children}
    </button>
  );
}
