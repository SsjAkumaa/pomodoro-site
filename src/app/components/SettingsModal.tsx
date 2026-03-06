import React, { useRef } from "react";
import { X, Upload, Volume2, Palette, Clock, Image, Wifi, VolumeX, Zap } from "lucide-react";
import { saveFile, deleteFile } from "./fileStorage";

export interface AppSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionCount: number;
  neonColor: string;
  alarmSoundUrl: string | null;
  alarmSoundName: string | null;
  alarmVolume: number; // 0 to 1
  backgroundType: "default" | "image" | "video";
  backgroundUrl: string | null;
  backgroundName: string | null;
  weatherCity: string;
  autoMode: boolean;
}

interface SettingsModalProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClose: () => void;
}

const NEON_PRESETS = [
  "#00f5ff",
  "#ff006e",
  "#7b2fff",
  "#00ff88",
  "#ff9500",
  "#ff3cac",
  "#ffffff",
];

export function SettingsModal({ settings, onSettingsChange, onClose }: SettingsModalProps) {
  const alarmInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const neon = settings.neonColor;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const update = (patch: Partial<AppSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  const handleAlarmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await saveFile("alarm", file); } catch {}
    const url = URL.createObjectURL(file);
    update({ alarmSoundUrl: url, alarmSoundName: file.name });
    e.target.value = "";
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await saveFile("background", file); } catch {}
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    update({ backgroundUrl: url, backgroundType: isVideo ? "video" : "image", backgroundName: file.name });
    e.target.value = "";
  };

  const handleResetBackground = async () => {
    try { await deleteFile("background"); } catch {}
    update({ backgroundType: "default", backgroundUrl: null, backgroundName: null });
  };

  const handleRemoveAlarm = async () => {
    try { await deleteFile("alarm"); } catch {}
    update({ alarmSoundUrl: null, alarmSoundName: null });
  };

  const volumePct = Math.round(settings.alarmVolume * 100);

  return (
    <div
      className="fixed inset-0 flex items-center justify-end"
      style={{ zIndex: 100 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Side panel */}
      <div
        className="relative h-full overflow-y-auto flex flex-col"
        style={{
          width: isMobile ? "100%" : 380,
          background: "linear-gradient(180deg, rgba(4,4,18,0.98) 0%, rgba(6,6,22,0.98) 100%)",
          borderLeft: isMobile ? "none" : `1px solid ${neon}40`,
          borderTop: isMobile ? `1px solid ${neon}30` : "none",
          boxShadow: isMobile ? `0 -8px 40px ${neon}18` : `-8px 0 40px ${neon}18`,
          fontFamily: "Orbitron, monospace",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: "rgba(4,4,18,0.99)", borderBottom: `1px solid ${neon}25` }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: neon, boxShadow: `0 0 8px ${neon}, 0 0 16px ${neon}` }} />
            <span style={{ color: neon, fontSize: 13, letterSpacing: "0.2em" }}>PARAMÈTRES</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all"
            style={{ width: 32, height: 32, border: `1px solid ${neon}40`, color: neon, background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}20`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${neon}60`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 flex flex-col gap-5">

          {/* ── TIMER ── */}
          <Section icon={<Clock size={14} />} title="TIMER" neon={neon}>
            <div className="flex flex-col gap-3">
              <SettingRow label="Focus">
                <NumberInput value={settings.focusDuration} min={1} max={120} onChange={(v) => update({ focusDuration: v })} neon={neon} suffix="min" />
              </SettingRow>
              <SettingRow label="Pause courte">
                <NumberInput value={settings.shortBreakDuration} min={1} max={60} onChange={(v) => update({ shortBreakDuration: v })} neon={neon} suffix="min" />
              </SettingRow>
              <SettingRow label="Pause longue">
                <NumberInput value={settings.longBreakDuration} min={1} max={60} onChange={(v) => update({ longBreakDuration: v })} neon={neon} suffix="min" />
              </SettingRow>
              <SettingRow label="Sessions">
                <NumberInput value={settings.sessionCount} min={1} max={10} onChange={(v) => update({ sessionCount: v })} neon={neon} />
              </SettingRow>

              {/* ── AUTO MODE ── */}
              <div
                className="flex items-center justify-between rounded-lg px-3 py-3 mt-1"
                style={{
                  background: settings.autoMode ? `${neon}0e` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${settings.autoMode ? neon + "45" : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.25s ease",
                  boxShadow: settings.autoMode ? `0 0 14px ${neon}18` : "none",
                }}
              >
                <div className="flex items-center gap-2">
                  <Zap size={13} style={{ color: settings.autoMode ? neon : "rgba(255,255,255,0.35)" }} />
                  <div>
                    <div style={{ fontSize: 11, color: settings.autoMode ? neon : "rgba(255,255,255,0.55)", letterSpacing: "0.15em" }}>
                      MODE AUTO
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", marginTop: 2 }}>
                      Enchaîne les sessions automatiquement
                    </div>
                  </div>
                </div>
                <Toggle value={settings.autoMode} onChange={(v) => update({ autoMode: v })} neon={neon} />
              </div>
            </div>
          </Section>

          {/* ── COULEUR NÉON ── */}
          <Section icon={<Palette size={14} />} title="COULEUR NÉON" neon={neon}>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 flex-wrap">
                {NEON_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => update({ neonColor: color })}
                    className="rounded-full transition-all"
                    style={{
                      width: 30, height: 30,
                      background: color,
                      boxShadow: settings.neonColor === color ? `0 0 12px ${color}, 0 0 24px ${color}` : "none",
                      border: settings.neonColor === color ? "2px solid white" : "2px solid transparent",
                      transform: settings.neonColor === color ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.1em" }}>PERSONNALISÉ</span>
                <input
                  type="color"
                  value={settings.neonColor}
                  onChange={(e) => update({ neonColor: e.target.value })}
                  style={{ width: 36, height: 26, border: `1px solid ${neon}40`, background: "transparent", cursor: "pointer", borderRadius: 4, padding: 2 }}
                />
                <span style={{ color: neon, fontSize: 11, fontFamily: "Share Tech Mono, monospace" }}>
                  {settings.neonColor.toUpperCase()}
                </span>
              </div>
            </div>
          </Section>

          {/* ── ALARME ── */}
          <Section icon={<Volume2 size={14} />} title="SON D'ALARME" neon={neon}>
            <div className="flex flex-col gap-4">
              <SettingRow label="Volume">
                <div className="flex items-center gap-2">
                  <button onClick={() => update({ alarmVolume: 0 })} style={{ color: settings.alarmVolume === 0 ? neon : "rgba(255,255,255,0.3)" }}>
                    <VolumeX size={14} />
                  </button>
                  <div className="relative" style={{ width: 100 }}>
                    <input
                      type="range" min={0} max={100} value={volumePct}
                      onChange={(e) => update({ alarmVolume: Number(e.target.value) / 100 })}
                      className="volume-slider"
                      style={{ width: "100%", accentColor: neon }}
                    />
                  </div>
                  <button onClick={() => update({ alarmVolume: 1 })} style={{ color: settings.alarmVolume === 1 ? neon : "rgba(255,255,255,0.3)" }}>
                    <Volume2 size={14} />
                  </button>
                  <span style={{ color: neon, fontSize: 11, minWidth: 32, textAlign: "right", fontFamily: "Share Tech Mono, monospace" }}>
                    {volumePct}%
                  </span>
                </div>
              </SettingRow>

              {settings.alarmSoundName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: `${neon}10`, border: `1px solid ${neon}30` }}>
                  <Volume2 size={12} style={{ color: neon }} />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, flex: 1 }} className="truncate">{settings.alarmSoundName}</span>
                  <button onClick={handleRemoveAlarm} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ff006e"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}>
                    <X size={12} />
                  </button>
                </div>
              )}

              <input ref={alarmInputRef} type="file" accept=".mp3,.wav,.ogg,.m4a,audio/*" className="hidden" onChange={handleAlarmUpload} />
              <CyberButton onClick={() => alarmInputRef.current?.click()} neon={neon} icon={<Upload size={13} />}>
                {settings.alarmSoundName ? "CHANGER LE SON" : "IMPORTER UN MP3"}
              </CyberButton>
              {!settings.alarmSoundName && (
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.05em" }}>
                  3 bips par défaut si aucun fichier sélectionné
                </p>
              )}
            </div>
          </Section>

          {/* ── ARRIÈRE-PLAN ── */}
          <Section icon={<Image size={14} />} title="ARRIÈRE-PLAN" neon={neon}>
            <div className="flex flex-col gap-3">
              {settings.backgroundName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: `${neon}10`, border: `1px solid ${neon}30` }}>
                  <Image size={12} style={{ color: neon }} />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, flex: 1 }} className="truncate">{settings.backgroundName}</span>
                  <span style={{ color: `${neon}80`, fontSize: 9, letterSpacing: "0.1em", flexShrink: 0, marginRight: 4 }}>
                    {settings.backgroundType === "video" ? "VIDÉO" : "IMAGE"}
                  </span>
                  <button onClick={handleResetBackground} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ff006e"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}>
                    <X size={12} />
                  </button>
                </div>
              )}
              <input ref={bgInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm" className="hidden" onChange={handleBgUpload} />
              <CyberButton onClick={() => bgInputRef.current?.click()} neon={neon} icon={<Upload size={13} />}>
                {settings.backgroundName ? "CHANGER LE FOND" : "IMPORTER IMAGE / VIDÉO"}
              </CyberButton>
              {settings.backgroundType !== "default" && (
                <CyberButton onClick={handleResetBackground} neon="#ff4466" icon={<X size={13} />}>FOND PAR DÉFAUT</CyberButton>
              )}
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.05em" }}>
                Formats: PNG, JPG, GIF, WebP, MP4, WebM
              </p>
            </div>
          </Section>

          {/* ── MÉTÉO ── */}
          <Section icon={<Wifi size={14} />} title="MÉTÉO" neon={neon}>
            <SettingRow label="Ville">
              <input
                type="text"
                value={settings.weatherCity}
                onChange={(e) => update({ weatherCity: e.target.value })}
                placeholder="Paris"
                className="rounded px-3 py-1.5 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${neon}40`, color: "white", fontSize: 12, fontFamily: "Orbitron, monospace", width: 150 }}
              />
            </SettingRow>
          </Section>
        </div>

        <style>{`
          .volume-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; cursor: pointer; }
          .volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${neon}; cursor: pointer; box-shadow: 0 0 6px ${neon}, 0 0 12px ${neon}80; transition: box-shadow 0.2s ease; }
          .volume-slider::-webkit-slider-thumb:hover { box-shadow: 0 0 10px ${neon}, 0 0 20px ${neon}; }
          .volume-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${neon}; cursor: pointer; border: none; box-shadow: 0 0 6px ${neon}; }
          .volume-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(to right, ${neon} 0%, ${neon} ${volumePct}%, rgba(255,255,255,0.1) ${volumePct}%, rgba(255,255,255,0.1) 100%); }
        `}</style>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ icon, title, neon, children }: { icon: React.ReactNode; title: string; neon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${neon}18` }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: neon }}>{icon}</span>
        <span style={{ color: neon, fontSize: 11, letterSpacing: "0.2em" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, letterSpacing: "0.1em" }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, neon }: { value: boolean; onChange: (v: boolean) => void; neon: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26,
        borderRadius: 13,
        background: value ? neon : "rgba(255,255,255,0.08)",
        border: `1px solid ${value ? neon : "rgba(255,255,255,0.15)"}`,
        position: "relative",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: value ? `0 0 10px ${neon}80, 0 0 20px ${neon}40` : "none",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20, height: 20,
          borderRadius: "50%",
          background: value ? "#000" : "rgba(255,255,255,0.5)",
          position: "absolute",
          top: 2,
          left: value ? 24 : 2,
          transition: "left 0.25s ease, background 0.25s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
        }}
      />
    </button>
  );
}

function NumberInput({ value, min, max, onChange, neon, suffix }: {
  value: number; min: number; max: number; onChange: (v: number) => void; neon: string; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex items-center justify-center rounded transition-all"
        style={{ width: 26, height: 26, border: `1px solid ${neon}40`, color: neon, background: `${neon}10`, fontSize: 18, lineHeight: 1 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}25`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}10`; }}
      >−</button>
      <span style={{ color: "white", fontSize: 13, minWidth: 40, textAlign: "center", fontFamily: "Share Tech Mono, monospace" }}>
        {value}{suffix ? ` ${suffix}` : ""}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex items-center justify-center rounded transition-all"
        style={{ width: 26, height: 26, border: `1px solid ${neon}40`, color: neon, background: `${neon}10`, fontSize: 18, lineHeight: 1 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}25`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}10`; }}
      >+</button>
    </div>
  );
}

function CyberButton({ onClick, neon, icon, children }: { onClick: () => void; neon: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded transition-all"
      style={{ border: `1px solid ${neon}45`, color: neon, background: `${neon}08`, fontSize: 11, letterSpacing: "0.15em", fontFamily: "Orbitron, monospace" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}20`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${neon}35`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${neon}08`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      {icon}{children}
    </button>
  );
}