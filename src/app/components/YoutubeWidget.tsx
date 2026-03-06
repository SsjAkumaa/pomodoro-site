import { useState } from 'react';

export function YoutubeWidget() {
  const [videoId, setVideoId] = useState('jfKfPfyJRdk');
  const [inputValue, setInputValue] = useState('');

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      const id = extractVideoId(inputValue.trim());
      if (id) {
        setVideoId(id);
        setInputValue('');
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="URL ou ID YouTube"
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:border-white/50 outline-none"
        />
        <button
          onClick={handleSubmit}
          className="px-3 py-2 text-sm rounded-lg bg-white/15 text-white hover:bg-white/25 transition-all"
        >
          OK
        </button>
      </div>

      <div className="rounded-lg overflow-hidden bg-black/10 border border-white/10">
        <iframe
          width="100%"
          height="300"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}