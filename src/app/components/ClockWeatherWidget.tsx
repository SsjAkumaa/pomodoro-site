import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Snowflake } from 'lucide-react';

export function ClockWeatherWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [temperature] = useState(Math.floor(Math.random() * 20) + 10); // Simulated temperature
  const [weather] = useState<'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snowy'>(
    ['sunny', 'cloudy', 'rainy', 'windy', 'snowy'][Math.floor(Math.random() * 5)] as any
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny':
        return <Sun size={32} className="text-yellow-300" />;
      case 'cloudy':
        return <Cloud size={32} className="text-gray-300" />;
      case 'rainy':
        return <CloudRain size={32} className="text-blue-300" />;
      case 'windy':
        return <Wind size={32} className="text-cyan-300" />;
      case 'snowy':
        return <Snowflake size={32} className="text-blue-200" />;
    }
  };

  const getWeatherText = () => {
    switch (weather) {
      case 'sunny':
        return 'Ensoleillé';
      case 'cloudy':
        return 'Nuageux';
      case 'rainy':
        return 'Pluvieux';
      case 'windy':
        return 'Venteux';
      case 'snowy':
        return 'Neigeux';
    }
  };

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const date = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Time Display */}
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-7xl font-light text-white">{hours}</span>
          <span className="text-7xl font-light text-white/60 animate-pulse">:</span>
          <span className="text-7xl font-light text-white">{minutes}</span>
          <span className="text-2xl font-light text-white/40 ml-2">{seconds}</span>
        </div>
        <div className="text-white/60 text-sm mt-2 capitalize">{date}</div>
      </div>

      {/* Weather Display */}
      <div className="flex items-center gap-6 bg-white/5 rounded-2xl px-8 py-4 border border-white/10">
        <div className="flex items-center gap-3">
          {getWeatherIcon()}
          <div>
            <div className="text-white text-lg font-medium">{getWeatherText()}</div>
            <div className="text-white/60 text-sm">Météo simulée</div>
          </div>
        </div>
        <div className="text-5xl font-light text-white border-l border-white/20 pl-6">
          {temperature}°
        </div>
      </div>
    </div>
  );
}
