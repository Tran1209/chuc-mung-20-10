import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { REASONS_LOVE } from '../data/memories.ts';
import confetti from 'canvas-confetti';

export const ReasonsDeck: React.FC = () => {
  const [loved, setLoved] = useState<boolean>(false);

  const handleBoostLove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoved(true);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: {
        x: rect.left / window.innerWidth,
        y: rect.top / window.innerHeight,
      },
      colors: ['#fb7185', '#f43f5e', '#fda4af', '#f472b6'],
    });
  };

  const reason = REASONS_LOVE[0];

  return (
    <section id="reasons" className="py-16 md:py-24 bg-rose-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-2 uppercase">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Tình Cảm Chân Thành</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-stone-900 tracking-tight mb-3">
            Lý Do Anh Luôn Yêu Em
          </h2>
          <p className="text-sm text-stone-600">
            Không cần một danh sách dài dòng hoa mỹ, chỉ cần một điều giản dị này thôi.
          </p>
        </div>

        {/* Single Centerpiece Reason Card */}
        {reason && (
          <div className="max-w-xl mx-auto">
            <div
              onClick={handleBoostLove}
              className="relative p-8 sm:p-10 rounded-3xl transition-all duration-300 border border-rose-200/90 bg-gradient-to-br from-rose-50 via-pink-50/70 to-amber-50/60 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <span className="text-4xl drop-shadow-xs">{reason.emoji}</span>
                  <button
                    onClick={handleBoostLove}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-rose-600 text-xs font-medium shadow-2xs border border-rose-200/60 transition-colors cursor-pointer"
                    title="Gửi ngàn yêu thương"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>{loved ? 'Yêu em vô điều kiện 💖' : 'Chạm để gửi tim'}</span>
                  </button>
                </div>

                <h3 className="font-serif-romantic font-bold text-stone-900 text-2xl sm:text-3xl mb-3 tracking-tight">
                  {reason.title}
                </h3>

                <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-serif-romantic">
                  {reason.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-rose-200/60 flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Điều duy nhất & Mãi mãi
                </span>
                <span className="font-serif-romantic italic text-rose-500 font-semibold">
                  Thương em nhất trên đời
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
