import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Type } from 'lucide-react';

interface PomodoroWidgetProps {
  initialWork?: number;
  initialShort?: number;
  initialLong?: number;
}

const fontOptions = [
  { name: 'Moderne', value: 'ui-sans-serif, system-ui, sans-serif' },
  { name: 'Mono', value: 'ui-monospace, monospace' },
  { name: 'Serif', value: 'ui-serif, Georgia, serif' },
  { name: 'Rounded', value: 'Helvetica Rounded, Arial Rounded MT Bold, sans-serif' },
];

export function PomodoroWidget({ 
  initialWork = 25, 
  initialShort = 5, 
  initialLong = 15 
}: PomodoroWidgetProps) {
  const [timeLeft, setTimeLeft] = useState(initialWork * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [workDuration, setWorkDuration] = useState(initialWork);
  const [shortBreak, setShortBreak] = useState(initialShort);
  const [longBreak, setLongBreak] = useState(initialLong);
  const [selectedFont, setSelectedFont] = useState(fontOptions[0].value);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) {
        setMode('long');
        setTimeLeft(longBreak * 60);
      } else {
        setMode('short');
        setTimeLeft(shortBreak * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'short':
        setTimeLeft(shortBreak * 60);
        break;
      case 'long':
        setTimeLeft(longBreak * 60);
        break;
    }
  };

  const switchMode = (newMode: 'work' | 'short' | 'long') => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'short':
        setTimeLeft(shortBreak * 60);
        break;
      case 'long':
        setTimeLeft(longBreak * 60);
        break;
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = mode === 'work' 
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : mode === 'short'
    ? ((shortBreak * 60 - timeLeft) / (shortBreak * 60)) * 100
    : ((longBreak * 60 - timeLeft) / (longBreak * 60)) * 100;

  return (
    <div className="flex flex-col items-center gap-4">
      {!showSettings ? (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => switchMode('work')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                mode === 'work'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Travail
            </button>
            <button
              onClick={() => switchMode('short')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                mode === 'short'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Pause
            </button>
            <button
              onClick={() => switchMode('long')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                mode === 'long'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Longue
            </button>
          </div>

          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="85"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="85"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 85}`}
                strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-light text-white" style={{ fontFamily: selectedFont }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className="w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-all shadow-lg"
            >
              {isActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-all shadow-lg"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-all shadow-lg"
            >
              <SettingsIcon size={18} />
            </button>
          </div>

          <div className="text-white/50 text-sm">
            Sessions: {sessions}
          </div>
        </>
      ) : (
        <div className="w-full space-y-3">
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm flex items-center gap-2">
              <Type size={16} />
              Police du timer
            </label>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm">Travail (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm">Pause courte (min)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreak}
              onChange={(e) => setShortBreak(parseInt(e.target.value) || 5)}
              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm">Pause longue (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={longBreak}
              onChange={(e) => setLongBreak(parseInt(e.target.value) || 15)}
              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
            />
          </div>

          <button
            onClick={() => {
              setShowSettings(false);
              resetTimer();
            }}
            className="w-full px-4 py-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-all"
          >
            Enregistrer
          </button>
        </div>
      )}
    </div>
  );
}