import { useState, useRef, useEffect } from 'react';
import { VolumeX, Cloud, Flame, Waves, Coffee, Wind, Bird } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
}

const sounds: Sound[] = [
  {
    id: 'rain',
    name: 'Pluie',
    icon: <Cloud size={20} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3'
  },
  {
    id: 'fireplace',
    name: 'Cheminée',
    icon: <Flame size={20} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3'
  },
  {
    id: 'ocean',
    name: 'Océan',
    icon: <Waves size={20} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3'
  },
  {
    id: 'wind',
    name: 'Vent',
    icon: <Wind size={20} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3'
  },
  {
    id: 'birds',
    name: 'Oiseaux',
    icon: <Bird size={20} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3'
  },
  {
    id: 'coffee',
    name: 'Café',
    icon: <Coffee size={20} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3'
  }
];

export function AmbientSoundsWidget() {
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    sounds.forEach((sound) => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volumes[sound.id] || 0.5;
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
    };
  }, []);

  const toggleSound = (soundId: string) => {
    const newActiveSounds = new Set(activeSounds);
    const audio = audioRefs.current[soundId];

    if (activeSounds.has(soundId)) {
      newActiveSounds.delete(soundId);
      audio?.pause();
    } else {
      newActiveSounds.add(soundId);
      audio?.play().catch(err => console.log('Audio play failed:', err));
    }

    setActiveSounds(newActiveSounds);
  };

  const handleVolumeChange = (soundId: string, volume: number) => {
    setVolumes((prev) => ({ ...prev, [soundId]: volume }));
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].volume = volume;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {sounds.map((sound) => {
        const isActive = activeSounds.has(sound.id);
        const volume = volumes[sound.id] || 0.5;

        return (
          <div key={sound.id} className="flex flex-col gap-2">
            <button
              onClick={() => toggleSound(sound.id)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {isActive ? sound.icon : <VolumeX size={20} />}
              <span className="text-xs">{sound.name}</span>
            </button>

            {isActive && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}