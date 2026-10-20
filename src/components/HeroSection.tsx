import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Clock } from 'lucide-react';
import { calculateDaysTogether, getGreetingByHour } from '../utils/rules.ts';

interface HeroSectionProps {
  onOpenLetter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenLetter }) => {
  // Count starting from 1/7/2026 (July 1st, 2026) as requested
  const [anniversaryDate, setAnniversaryDate] = useState<string>(() => {
    try {
      return localStorage.getItem('anniversary_date_2010') || '2026-07-01';
    } catch {
      return '2026-07-01';
    }
  });
  const [herName, setHerName] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('love_hero_her_name_2010') ||
        localStorage.getItem('love_letter_nickname_2010') ||
        'Em Bé Của Anh'
      );
    } catch {
      return 'Em Bé Của Anh';
    }
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Listen to nickname changes from letter
  useEffect(() => {
    const handleNicknameSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setHerName(customEvent.detail);
        try {
          localStorage.setItem('love_hero_her_name_2010', customEvent.detail);
        } catch {}
      }
    };
    window.addEventListener('love_nickname_changed', handleNicknameSync);
    return () => window.removeEventListener('love_nickname_changed', handleNicknameSync);
  }, []);

  // Live real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDateChange = (newDate: string) => {
    setAnniversaryDate(newDate);
    try {
      localStorage.setItem('anniversary_date_2010', newDate);
    } catch {
      // ignore
    }
  };

  const startDate = new Date(`${anniversaryDate}T00:00:00`);
  const duration = calculateDaysTogether(startDate, currentTime);
  const greeting = getGreetingByHour(currentTime);

  // Format date display (e.g. 01/07/2026)
  const [year, month, day] = anniversaryDate.split('-');
  const formattedStartStr = `${day}/${month}/${year}`;

  return (
    <section id="top" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-200/40 via-pink-100/30 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif-romantic font-bold text-stone-900 tracking-tight leading-tight md:leading-tight mb-6">
          Chúc Mừng 20/10 <br className="hidden sm:inline" />
          {isEditingName ? (
            <span className="inline-flex items-center gap-2">
              <input
                type="text"
                value={herName}
                onChange={(e) => {
                  const val = e.target.value;
                  setHerName(val);
                  try {
                    localStorage.setItem('love_hero_her_name_2010', val);
                  } catch {}
                }}
                className="text-center font-serif-romantic italic text-rose-600 border-b-2 border-rose-400 bg-transparent px-2 text-3xl sm:text-4xl focus:outline-none"
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="text-xs bg-rose-500 text-white px-2.5 py-1 rounded-full font-sans not-italic"
              >
                Xong
              </button>
            </span>
          ) : (
            <span
              onClick={() => setIsEditingName(true)}
              title="Nhấn để đổi tên/biệt danh"
              className="text-rose-600 italic cursor-pointer hover:underline decoration-rose-300 decoration-wavy"
            >
              {herName}
            </span>
          )}{' '}
          💖
        </h1>

        {/* Lead subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 font-normal leading-relaxed mb-10 text-balance">
          Hôm nay là Ngày Phụ Nữ Việt Nam 20/10, nhưng với anh, mỗi ngày được nhìn thấy nụ cười
          của em đều là một ngày đặc biệt ngập tràn yêu thương và hạnh phúc.
        </p>

        {/* Days Together Card - Live counting from 01/07/2026 */}
        <div className="max-w-md mx-auto mb-10 p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-sm border border-rose-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium text-rose-600">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Hành Trình Yêu Thương
            </span>
            <button
              onClick={() => setIsEditingDate(!isEditingDate)}
              className="text-stone-400 hover:text-stone-700 transition-colors underline text-xs cursor-pointer"
              title="Đổi ngày kỷ niệm"
            >
              {isEditingDate ? 'Đóng' : 'Đổi ngày'}
            </button>
          </div>

          {isEditingDate ? (
            <div className="my-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 flex flex-col sm:flex-row items-center justify-center gap-2">
              <label htmlFor="anniv-date" className="text-xs text-stone-600 font-medium">
                Ngày bắt đầu:
              </label>
              <input
                id="anniv-date"
                type="date"
                value={anniversaryDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-2.5 py-1 text-xs border border-rose-200 rounded-lg text-stone-800 bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
              <button
                onClick={() => handleDateChange('2026-07-01')}
                className="px-2 py-1 text-[11px] rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
              >
                Đặt về 01/07/2026
              </button>
            </div>
          ) : null}

          {/* Primary Big Days Count */}
          <div className="flex items-baseline justify-center gap-2 py-1">
            <span className="font-serif-romantic text-5xl sm:text-6xl font-bold text-rose-600 tracking-tight tabular-nums">
              {duration.totalDays.toLocaleString()}
            </span>
            <span className="text-stone-600 font-medium text-base sm:text-lg">ngày</span>
          </div>

          {/* Real-Time Hours, Minutes, Seconds Breakdown */}
          <div className="mt-3 pt-3 border-t border-rose-100/80 flex items-center justify-center gap-3 text-xs text-stone-600 font-mono tabular-nums">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>
                <strong className="text-stone-800 font-semibold">{String(duration.hours).padStart(2, '0')}</strong> giờ
              </span>
            </div>
            <span>:</span>
            <div>
              <strong className="text-stone-800 font-semibold">{String(duration.minutes).padStart(2, '0')}</strong> phút
            </div>
            <span>:</span>
            <div>
              <strong className="text-rose-600 font-semibold">{String(duration.seconds).padStart(2, '0')}</strong> giây
            </div>
          </div>

          <p className="text-[11px] text-stone-500 mt-3">
            Đồng hành cùng nhau từ ngày <span className="font-semibold text-rose-600">{formattedStartStr}</span> đến giờ
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="#memories"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-all shadow-md shadow-rose-200/50 hover:shadow-rose-300 flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Xem 11 Khoảnh Khắc Ngọt Ngào</span>
          </a>

          <button
            onClick={onOpenLetter}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 font-medium text-sm transition-all border border-rose-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mở Bức Thư Tình 20/10</span>
          </button>
        </div>

        {/* Clean unboxed proof metadata with typographic separators */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-stone-500">
          <span>11 khoảnh khắc kỷ niệm</span>
          <span aria-hidden="true">·</span>
          <span>Thư tình viết riêng cho em</span>
          <span aria-hidden="true">·</span>
          <span>6 phiếu yêu thương bí mật</span>
        </div>
      </div>
    </section>
  );
};
