import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Cloud, Flame, Waves, Coffee, Wind, Bird } from 'lucide-react';

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
    icon: <Cloud size={24} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3'
  },
  {
    id: 'fireplace',
    name: 'Cheminée',
    icon: <Flame size={24} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3'
  },
  {
    id: 'ocean',
    name: 'Océan',
    icon: <Waves size={24} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3'
  },
  {
    id: 'wind',
    name: 'Vent',
    icon: <Wind size={24} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3'
  },
  {
    id: 'birds',
    name: 'Oiseaux',
    icon: <Bird size={24} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3'
  },
  {
    id: 'coffee',
    name: 'Café',
    icon: <Coffee size={24} />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3'
  }
];

export function AmbientSounds() {
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    sounds.forEach((sound) => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volumes[sound.id] || 0.5;
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      // Cleanup audio on unmount
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-white mb-2">
        <Volume2 size={20} />
        <span className="font-medium">Sons d'ambiance</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sounds.map((sound) => {
          const isActive = activeSounds.has(sound.id);
          const volume = volumes[sound.id] || 0.5;

          return (
            <div key={sound.id} className="flex flex-col gap-2">
              <button
                onClick={() => toggleSound(sound.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {isActive ? sound.icon : <VolumeX size={24} />}
                <span className="text-sm">{sound.name}</span>
              </button>

              {isActive && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
