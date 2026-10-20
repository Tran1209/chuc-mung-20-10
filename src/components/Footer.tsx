import React from 'react';
import { Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-rose-100 bg-white/80 py-12 text-center text-xs text-stone-500">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5 text-rose-500 font-serif-romantic font-bold text-base">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Mãi Mãi Yêu Em Bé</span>
        </div>

        <p className="max-w-md leading-relaxed text-stone-600">
          Trang web được lập trình bằng cả trái tim dành riêng cho người con gái anh yêu nhất nhân dịp 20/10. Chúc em luôn rạng rỡ và hạnh phúc bên anh!
        </p>

        <div className="flex items-center gap-4 text-stone-400 mt-2">
          <span>Ngày Phụ Nữ Việt Nam 20/10</span>
          <span>·</span>
          <span>Tình Yêu Bất Tận</span>
          <span>·</span>
          <button
            onClick={scrollToTop}
            className="text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors underline cursor-pointer"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Lên đầu trang</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
