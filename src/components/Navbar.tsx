import React from 'react';
import { Heart, Music, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  trackName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isPlayingMusic,
  onToggleMusic,
  trackName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="flex items-center gap-2 text-rose-600 font-serif-romantic font-bold text-xl tracking-tight whitespace-nowrap shrink-0 hover:text-rose-700 transition-colors"
        >
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse-subtle" />
          <span>20/10</span>
        </a>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <a
            href="#memories"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Khoảnh Khắc
          </a>
          <a
            href="#letter"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Bức Thư Tình
          </a>
          <a
            href="#reasons"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Lý Do Yêu Em
          </a>
          <a
            href="#gift"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Hộp Quà Bí Mật
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMusic}
            aria-label={isPlayingMusic ? 'Tắt nhạc nền' : 'Bật nhạc nền lãng mạn'}
            title={isPlayingMusic ? `Đang phát: ${trackName}` : 'Bật nhạc nền lãng mạn'}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap shrink-0 shadow-sm ${
              isPlayingMusic
                ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            {isPlayingMusic ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Nơi Này Có Anh ♫</span>
                <span className="sm:hidden">Nơi Này Có Anh</span>
              </>
            ) : (
              <>
                <Music className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phát &quot;Nơi Này Có Anh&quot;</span>
                <span className="sm:hidden">Phát Nhạc</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
