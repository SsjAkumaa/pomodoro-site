import { useState } from 'react';
import { Palette, Image as ImageIcon, Layers } from 'lucide-react';

interface BackgroundCustomizerProps {
  onBackgroundChange: (background: string) => void;
  currentBackground: string;
}

export function BackgroundCustomizer({ onBackgroundChange, currentBackground }: BackgroundCustomizerProps) {
  const [mode, setMode] = useState<'solid' | 'gradient' | 'image'>('gradient');
  const [imageUrl, setImageUrl] = useState('');

  const solidColors = [
    '#1e3a8a', '#7c2d12', '#064e3b', '#4c1d95', '#831843',
    '#0f172a', '#1e293b', '#374151', '#422006', '#14532d'
  ];

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  ];

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      onBackgroundChange(`url(${imageUrl})`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('solid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            mode === 'solid'
              ? 'bg-white/30 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Palette size={18} />
          Couleurs
        </button>
        <button
          onClick={() => setMode('gradient')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            mode === 'gradient'
              ? 'bg-white/30 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Layers size={18} />
          Dégradés
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            mode === 'image'
              ? 'bg-white/30 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <ImageIcon size={18} />
          Image
        </button>
      </div>

      {mode === 'solid' && (
        <div className="grid grid-cols-5 gap-3">
          {solidColors.map((color) => (
            <button
              key={color}
              onClick={() => onBackgroundChange(color)}
              className="w-12 h-12 rounded-lg hover:scale-110 transition-transform ring-2 ring-white/20 hover:ring-white/50"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {mode === 'gradient' && (
        <div className="grid grid-cols-2 gap-3">
          {gradients.map((gradient, index) => (
            <button
              key={index}
              onClick={() => onBackgroundChange(gradient)}
              className="h-16 rounded-lg hover:scale-105 transition-transform ring-2 ring-white/20 hover:ring-white/50"
              style={{ background: gradient }}
            />
          ))}
        </div>
      )}

      {mode === 'image' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de l'image"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/50 outline-none"
            />
            <button
              onClick={handleImageUrlSubmit}
              className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              Appliquer
            </button>
          </div>
          <div className="text-white/60 text-sm">
            Conseil: Utilisez des images de haute qualité ou des URL Unsplash
          </div>
        </div>
      )}
    </div>
  );
}
