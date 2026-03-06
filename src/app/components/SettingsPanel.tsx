import { useState } from 'react';
import { Settings, Clock } from 'lucide-react';

interface SettingsPanelProps {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  onSettingsChange: (work: number, short: number, long: number) => void;
}

export function SettingsPanel({ 
  workDuration, 
  shortBreak, 
  longBreak, 
  onSettingsChange 
}: SettingsPanelProps) {
  const [localWork, setLocalWork] = useState(workDuration);
  const [localShort, setLocalShort] = useState(shortBreak);
  const [localLong, setLocalLong] = useState(longBreak);

  const handleSave = () => {
    onSettingsChange(localWork, localShort, localLong);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-white mb-2">
        <Settings size={20} />
        <span className="font-medium">Réglages du timer</span>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm flex items-center gap-2">
            <Clock size={16} />
            Durée de travail (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={localWork}
            onChange={(e) => setLocalWork(parseInt(e.target.value) || 25)}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white text-sm flex items-center gap-2">
            <Clock size={16} />
            Pause courte (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={localShort}
            onChange={(e) => setLocalShort(parseInt(e.target.value) || 5)}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white text-sm flex items-center gap-2">
            <Clock size={16} />
            Pause longue (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={localLong}
            onChange={(e) => setLocalLong(parseInt(e.target.value) || 15)}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
