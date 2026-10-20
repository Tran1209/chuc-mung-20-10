import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, CheckCircle2, Send, Heart, RotateCcw } from 'lucide-react';
import { INITIAL_COUPONS } from '../data/memories.ts';
import { LoveCoupon } from '../types/index.ts';
import { calculateRedeemedCoupons, sanitizeWish } from '../utils/rules.ts';
import confetti from 'canvas-confetti';

export const SurpriseGift: React.FC = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [coupons, setCoupons] = useState<LoveCoupon[]>(INITIAL_COUPONS);
  const [wishInput, setWishInput] = useState<string>('');
  const [savedWishes, setSavedWishes] = useState<string[]>([]);
  const [wishStatus, setWishStatus] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('love_wishes_2010');
      if (stored) {
        setSavedWishes(JSON.parse(stored));
      }
      const storedCoupons = localStorage.getItem('love_coupons_2010');
      if (storedCoupons) {
        setCoupons(JSON.parse(storedCoupons));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenGift = () => {
    setIsOpened(true);
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#38bdf8', '#a855f7'],
    });
  };

  const toggleRedeem = (id: string) => {
    const updated = coupons.map((c) =>
      c.id === id ? { ...c, isRedeemed: !c.isRedeemed } : c
    );
    setCoupons(updated);
    try {
      localStorage.setItem('love_coupons_2010', JSON.stringify(updated));
    } catch {
      // ignore
    }

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#f43f5e'],
    });
  };

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    const result = sanitizeWish(wishInput);
    if (!result.valid) {
      setWishStatus(result.message);
      return;
    }

    const updated = [result.sanitized, ...savedWishes];
    setSavedWishes(updated);
    try {
      localStorage.setItem('love_wishes_2010', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setWishInput('');
    setWishStatus('Anh đã nhận được điều ước rồi! Hứa sẽ thực hiện cho em bé nhé 💖');

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24'],
    });

    setTimeout(() => {
      setWishStatus('');
    }, 4500);
  };

  const stats = calculateRedeemedCoupons(coupons);

  return (
    <section id="gift" className="py-16 md:py-24 bg-white border-t border-rose-100/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-2 uppercase">
            <Gift className="w-3.5 h-3.5" />
            <span>Quà Tặng Đặc Quyền</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-stone-900 tracking-tight mb-3">
            Hộp Quà Bất Ngờ & Phiếu Yêu Thương
          </h2>
          <p className="text-sm text-stone-600">
            Mở hộp quà để nhận 6 phiếu đặc quyền vô điều kiện và gửi gắm mọi điều ước em mong muốn nhất hôm nay.
          </p>
        </div>

        {/* Gift Box Interaction */}
        {!isOpened ? (
          <div className="max-w-md mx-auto text-center py-10">
            <div
              onClick={handleOpenGift}
              className="group relative cursor-pointer mx-auto w-56 h-56 rounded-3xl bg-gradient-to-tr from-rose-500 via-rose-400 to-pink-500 p-8 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center text-white ring-8 ring-rose-100"
            >
              {/* Ribbon Cross */}
              <div
                className="absolute inset-x-0 h-8 top-1/2 -translate-y-1/2 bg-amber-300/80 shadow-xs pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute inset-y-0 w-8 left-1/2 -translate-x-1/2 bg-amber-300/80 shadow-xs pointer-events-none"
                aria-hidden="true"
              />

              {/* Bow on top */}
              <div className="absolute -top-4 w-12 h-8 rounded-full bg-amber-300 shadow-md flex items-center justify-center text-rose-700 font-bold text-xs">
                🎀
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <Gift className="w-16 h-16 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-serif-romantic text-lg font-bold mt-2">
                  Chạm để mở quà
                </span>
                <span className="text-[11px] text-rose-100 mt-1">Dành tặng riêng em</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 mt-6">
              Bên trong có những phần quà đặc biệt không thể mua được bằng tiền!
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Progress bar of redeemed coupons */}
            <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>
                  Đã đổi:{' '}
                  <strong className="text-rose-600 font-bold tabular-nums">
                    {stats.redeemedCount} / {stats.totalCount}
                  </strong>{' '}
                  phiếu
                </span>
              </div>
              <span className="font-mono text-stone-500 tabular-nums">{stats.percent}% hoàn thành</span>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  onClick={() => toggleRedeem(coupon.id)}
                  className={`relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    coupon.isRedeemed
                      ? 'bg-stone-50/80 border-stone-200 opacity-60'
                      : 'bg-white border-rose-200/80 shadow-xs hover:shadow-md hover:-translate-y-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{coupon.icon}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          coupon.isRedeemed
                            ? 'bg-stone-200 text-stone-600'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {coupon.isRedeemed ? 'Đã sử dụng' : 'Có hiệu lực'}
                      </span>
                    </div>

                    <h3 className="font-serif-romantic font-bold text-stone-900 text-base mb-1.5">
                      {coupon.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {coupon.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">Thời hạn: Trọn đời</span>
                    <button
                      className={`text-xs font-medium flex items-center gap-1 ${
                        coupon.isRedeemed ? 'text-stone-500' : 'text-rose-600'
                      }`}
                    >
                      {coupon.isRedeemed ? (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          <span>Dùng lại</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Dùng ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 20/10 Wish Box Form */}
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50/50 to-amber-50/40 border border-rose-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <h3 className="font-serif-romantic font-bold text-stone-900 text-xl">
                  Gửi Điều Ước 20/10 Đến Anh
                </h3>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Hôm nay em muốn ăn gì, đi đâu, hay có mong muốn gì thầm kín? Hãy ghi vào đây, anh sẽ biến điều ước thành hiện thực!
              </p>

              <form onSubmit={handleSendWish} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wishInput}
                    onChange={(e) => setWishInput(e.target.value)}
                    placeholder="Ví dụ: Cuối tuần đưa em đi ăn lẩu, chở em đi ngắm phố phường..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-rose-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>

                {wishStatus && (
                  <p className="text-xs text-rose-600 font-medium animate-fade-in">
                    {wishStatus}
                  </p>
                )}
              </form>

              {/* List of saved wishes */}
              {savedWishes.length > 0 && (
                <div className="mt-6 pt-5 border-t border-rose-200/60">
                  <span className="text-xs font-semibold text-stone-700 block mb-2">
                    Các điều ước em đã gửi:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {savedWishes.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/90 border border-rose-100 text-xs text-stone-700 flex items-start gap-2"
                      >
                        <span className="text-rose-500 font-bold shrink-0">✨</span>
                        <span className="flex-1">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
