import React, { useState, useEffect } from "react";
import { MapPin, Wind, Droplets, RefreshCw } from "lucide-react";

interface ClockWeatherProps {
  city: string;
  neonColor: string;
  /** Override container width (number = px, string = any CSS value) */
  width?: number | string;
  /** Compact horizontal layout for mobile */
  compact?: boolean;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

export function ClockWeather({ city, neonColor, width, compact = false }: ClockWeatherProps) {
  const neon = neonColor;
  const containerWidth = width ?? 260;

  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setWeatherLoading(true);
    setWeatherError(false);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("City not found");
      const { latitude, longitude } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&wind_speed_unit=kmh`
      );
      const weatherData = await weatherRes.json();
      const c = weatherData.current;
      setWeather({
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        description: getWeatherLabel(c.weather_code),
        windSpeed: Math.round(c.wind_speed_10m),
        humidity: c.relative_humidity_2m,
        weatherCode: c.weather_code,
      });
    } catch {
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  const hours   = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");

  const dateStr = time.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const containerStyle: React.CSSProperties = {
    width: containerWidth,
    background: "rgba(5,5,20,0.78)",
    border: `1px solid ${neon}50`,
    backdropFilter: "blur(12px)",
    boxShadow: `0 0 12px ${neon}40, 0 0 28px ${neon}1c, 0 0 56px ${neon}0a, inset 0 0 24px rgba(0,0,0,0.3)`,
    fontFamily: "Orbitron, monospace",
    borderRadius: 12,
    overflow: "hidden",
  };

  /* ─────────────── COMPACT / MOBILE layout ─────────────── */
  if (compact) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            padding: "14px 16px",
            gap: 14,
          }}
        >
          {/* LEFT: clock */}
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* HH:MM */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1, fontFamily: "Orbitron, monospace", letterSpacing: "-0.02em", textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                {hours}:{minutes}
              </span>
              <span style={{ fontSize: 14, color: neon, marginBottom: 2, fontFamily: "Share Tech Mono, monospace", textShadow: `0 0 8px ${neon}` }}>
                :{seconds}
              </span>
            </div>
            {/* Date */}
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 4, textTransform: "capitalize" }}>
              {dateStr}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: `${neon}22`, flexShrink: 0 }} />

          {/* RIGHT: weather */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
            {/* City + refresh */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={9} style={{ color: neon, flexShrink: 0 }} />
                <span style={{ color: neon, fontSize: 8, letterSpacing: "0.15em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {city.toUpperCase() || "AUCUNE VILLE"}
                </span>
              </div>
              <button
                onClick={fetchWeather}
                disabled={weatherLoading}
                style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
              >
                <RefreshCw size={10} style={{ animation: weatherLoading ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>

            {/* Weather data */}
            {weatherLoading && !weather && (
              <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${neon}30`, borderTopColor: neon, animation: "spin 1s linear infinite" }} />
              </div>
            )}
            {weatherError && !weather && (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.08em" }}>Ville introuvable</div>
            )}
            {weather && (
              <div>
                {/* Temp row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 22 }}>{getWeatherIcon(weather.weatherCode)}</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1, fontFamily: "Orbitron, monospace" }}>
                      {weather.temp}°
                    </div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
                      RESSENTI {weather.feelsLike}°
                    </div>
                  </div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em", marginLeft: "auto", textAlign: "right", maxWidth: 72 }}>
                    {weather.description}
                  </div>
                </div>
                {/* Wind + Humidity */}
                <div
                  style={{
                    display: "flex", gap: 10,
                    background: `${neon}08`,
                    border: `1px solid ${neon}15`,
                    borderRadius: 6, padding: "4px 8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Wind size={8} style={{ color: neon }} />
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{weather.windSpeed} km/h</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Droplets size={8} style={{ color: neon }} />
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{weather.humidity}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  /* ─────────────── FULL / DESKTOP layout ─────────────── */
  return (
    <div style={containerStyle}>
      {/* Clock */}
      <div className="px-5 py-4 flex flex-col items-center" style={{ borderBottom: `1px solid ${neon}20` }}>
        <div className="flex items-end gap-1">
          <span style={{ fontSize: 52, fontWeight: 700, color: "white", letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "Orbitron, monospace", textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
            {hours}:{minutes}
          </span>
          <span style={{ fontSize: 20, fontWeight: 400, color: neon, marginBottom: 4, fontFamily: "Share Tech Mono, monospace", textShadow: `0 0 10px ${neon}` }}>
            :{seconds}
          </span>
        </div>
        <div className="mt-1 capitalize" style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          {dateStr}
        </div>
      </div>

      {/* Weather */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: neon }} />
            <span style={{ color: neon, fontSize: 10, letterSpacing: "0.15em" }}>
              {city.toUpperCase() || "AUCUNE VILLE"}
            </span>
          </div>
          <button
            onClick={fetchWeather}
            disabled={weatherLoading}
            style={{ color: "rgba(255,255,255,0.3)" }}
            className="transition-all"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = neon; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
          >
            <RefreshCw size={12} style={{ animation: weatherLoading ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>

        {weatherLoading && !weather && (
          <div className="flex items-center justify-center py-3">
            <div className="rounded-full" style={{ width: 20, height: 20, border: `2px solid ${neon}30`, borderTopColor: neon, animation: "spin 1s linear infinite" }} />
          </div>
        )}
        {weatherError && !weather && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.1em", textAlign: "center", padding: "8px 0" }}>Ville introuvable</div>
        )}
        {weather && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 30 }}>{getWeatherIcon(weather.weatherCode)}</span>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "white", lineHeight: 1, fontFamily: "Orbitron, monospace" }}>{weather.temp}°</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>RESSENTI {weather.feelsLike}°</div>
                </div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", textAlign: "right", maxWidth: 90 }}>{weather.description}</div>
            </div>
            <div className="flex justify-between rounded-lg px-3 py-2" style={{ background: `${neon}08`, border: `1px solid ${neon}15` }}>
              <div className="flex items-center gap-1.5">
                <Wind size={10} style={{ color: neon }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets size={10} style={{ color: neon }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{weather.humidity}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function getWeatherLabel(code: number): string {
  if (code === 0)  return "CIEL DÉGAGÉ";
  if (code === 1)  return "PRINCIPALEMENT DÉGAGÉ";
  if (code === 2)  return "PARTIELLEMENT NUAGEUX";
  if (code === 3)  return "COUVERT";
  if (code <= 48)  return "BROUILLARD";
  if (code <= 55)  return "BRUINE";
  if (code <= 65)  return "PLUIE";
  if (code <= 67)  return "PLUIE VERGLAÇANTE";
  if (code <= 77)  return "NEIGE";
  if (code <= 82)  return "AVERSES";
  if (code <= 99)  return "ORAGE";
  return "INCONNU";
}
