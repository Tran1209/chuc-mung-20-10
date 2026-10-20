import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music2, Upload } from 'lucide-react';
import { romanticAudio } from '../utils/audio.ts';
import { savePhotoToDB, getPhotoFromDB } from '../utils/storage.ts';

interface MusicPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
  trackName: string;
  onTrackChange: (newName: string) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  onToggle,
  trackName,
  onTrackChange,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.45);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('romantic_music_volume_2010');
      if (saved) {
        const parsed = parseFloat(saved);
        romanticAudio.setVolume(parsed);
        return parsed;
      }
    } catch {}
    return 0.45;
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load any previously saved custom MP3 file for "Nơi Này Có Anh"
  useEffect(() => {
    getPhotoFromDB('custom_song_noi_nay_co_anh').then((savedAudioUrl) => {
      if (savedAudioUrl) {
        romanticAudio.setCustomAudio(savedAudioUrl);
        onTrackChange('Nơi Này Có Anh (Bản thu âm MP3)');
        if (isPlaying) {
          romanticAudio.play();
        }
      }
    });
  }, [onTrackChange, isPlaying]);

  const handleNextTrack = () => {
    const nextName = romanticAudio.nextTrack();
    onTrackChange(nextName);
    try {
      localStorage.setItem('romantic_track_name_2010', nextName);
    } catch {}
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    romanticAudio.setVolume(val);
    try {
      localStorage.setItem('romantic_music_volume_2010', val.toString());
    } catch {}
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume || 0.45);
      romanticAudio.setVolume(prevVolume || 0.45);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      romanticAudio.setVolume(0);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      romanticAudio.setCustomAudio(dataUrl);
      await savePhotoToDB('custom_song_noi_nay_co_anh', dataUrl);
      const songTitle = `Nơi Này Có Anh (${file.name})`;
      onTrackChange(songTitle);
      try {
        localStorage.setItem('romantic_track_name_2010', songTitle);
      } catch {}
      if (!isPlaying) {
        onToggle();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside
      aria-label="Trình phát nhạc lãng mạn Nơi Này Có Anh"
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-5 z-40 bg-white/95 backdrop-blur-md border border-rose-200/90 rounded-2xl shadow-xl px-3 py-2.5 flex items-center justify-between sm:justify-start gap-2.5 transition-all hover:shadow-2xl max-w-sm sm:max-w-none mx-auto sm:mx-0"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Vinyl / Music Icon */}
        <div
          className={`w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '6s' }}
        >
          <Music2 className="w-3.5 h-3.5" />
        </div>

        {/* Song Info */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[9px] text-rose-500 font-semibold uppercase tracking-wider flex items-center gap-1">
            <span>Bài hát:</span>
            <span className="text-stone-700 font-bold truncate">Nơi Này Có Anh</span>
          </span>
          <span className="text-xs font-serif-romantic font-bold text-stone-800 truncate max-w-[130px] sm:max-w-[180px]" title={trackName}>
            {trackName}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 border-l border-rose-100 pl-2 shrink-0">
        <button
          onClick={onToggle}
          aria-label={isPlaying ? 'Tạm dừng bài Nơi Này Có Anh' : 'Phát bài Nơi Này Có Anh'}
          className="p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-xs cursor-pointer"
          title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc "Nơi Này Có Anh" - Sơn Tùng M-TP'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleNextTrack}
          aria-label="Đổi bài hát kế tiếp"
          title="Đổi giai điệu kế tiếp"
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Custom MP3 File Selector */}
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Tải file MP3 Nơi Này Có Anh từ máy"
          title="Tải lên file MP3 bài Nơi Này Có Anh của riêng bạn"
          className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleAudioUpload}
        />

        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors hidden sm:inline-flex cursor-pointer"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Âm lượng nhạc"
          className="w-12 h-1 accent-rose-500 hidden sm:inline-block cursor-pointer"
        />
      </div>
    </aside>
  );
};
