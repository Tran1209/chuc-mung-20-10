import React, { useState } from 'react';
import { Heart, Sparkles, Smile } from 'lucide-react';
import { REASONS_LOVE } from '../data/memories.ts';
import confetti from 'canvas-confetti';

export const ReasonsDeck: React.FC = () => {
  const [activeReasonId, setActiveReasonId] = useState<number | null>(null);
  const defaultScores: Record<number, number> = {
    1: 100,
    2: 100,
    3: 100,
    4: 100,
    5: 100,
    6: 1000,
  };

  const [loveScores, setLoveScores] = useState<Record<number, number>>(() => {
    try {
      const stored = localStorage.getItem('love_scores_2010');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return defaultScores;
  });

  const handleBoostLove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLoveScores((prev) => {
      const updated = {
        ...prev,
        [id]: (prev[id] || 100) + 10,
      };
      try {
        localStorage.setItem('love_scores_2010', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 12,
      spread: 35,
      origin: {
        x: rect.left / window.innerWidth,
        y: rect.top / window.innerHeight,
      },
      colors: ['#fb7185', '#f43f5e', '#fda4af'],
    });
  };

  return (
    <section id="reasons" className="py-16 md:py-24 bg-rose-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-2 uppercase">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Tình Cảm Chân Thành</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-stone-900 tracking-tight mb-3">
            Những Lý Do Khiến Anh Say Đắm Em
          </h2>
          <p className="text-sm text-stone-600">
            Có hàng ngàn điều nhỏ bé đáng yêu ở em, mỗi ngày trôi qua anh lại thấy mình yêu em nhiều hơn một chút.
          </p>
        </div>

        {/* 6 Reasons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS_LOVE.map((item) => {
            const isSelected = activeReasonId === item.id;
            const score = loveScores[item.id] || 100;

            return (
              <div
                key={item.id}
                onClick={() => setActiveReasonId(isSelected ? null : item.id)}
                className={`relative p-6 rounded-3xl transition-all duration-300 border cursor-pointer flex flex-col justify-between ${item.bgGradient} ${
                  isSelected ? 'shadow-md scale-[1.02] ring-2 ring-rose-300' : 'hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-3xl">{item.emoji}</span>
                    <button
                      onClick={(e) => handleBoostLove(e, item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-rose-600 text-xs font-semibold shadow-2xs border border-rose-200/40 transition-colors"
                      title="Tăng điểm yêu thích"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span className="tabular-nums font-mono">+{score}%</span>
                    </button>
                  </div>

                  <h3 className="font-serif-romantic font-bold text-stone-900 text-lg mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200/40 flex items-center justify-between text-xs text-stone-500">
                  <span>Điều thứ 0{item.id}</span>
                  <span className="text-rose-600 font-medium">Mãi yêu thương 💖</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
