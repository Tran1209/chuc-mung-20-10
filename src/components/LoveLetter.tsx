import React, { useState } from 'react';
import { Heart, MailOpen, Edit3, Check, Copy, RotateCcw, Save } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isEditorMode } from '../utils/rules.ts';

interface LoveLetterProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DEFAULT_NICKNAME = "Em Bé Chuột của anh";
const DEFAULT_SENDER_NAME = "Người luôn yêu và cưng chiều em nhất";
const DEFAULT_LETTER_BODY = "Nhân ngày Phụ Nữ Việt Nam 20/10, anh muốn gửi đến em tất cả những tình cảm dịu dàng và chân thành nhất từ tận đáy lòng.\n\nCảm ơn em vì đã xuất hiện trong cuộc đời anh, mang theo nụ cười rạng rỡ làm sáng bừng cả những ngày giông bão. Cảm ơn từng khoảnh khắc mình bên nhau: từ những lúc em nhí nhảnh làm trò, những cái chu môi dỗi hờn đáng yêu, cho đến những lúc call với nhao.\n\nAnh không dám hứa cả thế giới sẽ luôn dịu dàng với em, nhưng anh hứa sẽ luôn đứng về phía em, bảo vệ em, lắng nghe mọi tâm sự và là nơi em có thể quay về trút bỏ mọi âu lo.\n\nChúc cho em bé của anh luôn xinh đẹp, luôn tự tin, khỏe mạnh và mỗi ngày trôi qua đều ngập tràn tiếng cười. Hôm nay là 20/10, nhưng với anh, cả 365 ngày trong năm đều là ngày để yêu thương và trân trọng em.";

export const LoveLetter: React.FC<LoveLetterProps> = ({ isOpen, onToggle }) => {
  const isEditor = isEditorMode();
  const [nickname, setNickname] = useState<string>(() => {
    try {
      return localStorage.getItem('love_letter_nickname_2010') || DEFAULT_NICKNAME;
    } catch {
      return DEFAULT_NICKNAME;
    }
  });

  const [senderName, setSenderName] = useState<string>(() => {
    try {
      return localStorage.getItem('love_letter_sender_2010') || DEFAULT_SENDER_NAME;
    } catch {
      return DEFAULT_SENDER_NAME;
    }
  });

  const [letterBody, setLetterBody] = useState<string>(() => {
    try {
      return localStorage.getItem('love_letter_body_2010') || DEFAULT_LETTER_BODY;
    } catch {
      return DEFAULT_LETTER_BODY;
    }
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedBadge, setSavedBadge] = useState<boolean>(false);

  const handleUpdateNickname = (val: string) => {
    setNickname(val);
    try {
      localStorage.setItem('love_letter_nickname_2010', val);
      // Also update hero name sync if needed
      window.dispatchEvent(new CustomEvent('love_nickname_changed', { detail: val }));
    } catch {}
  };

  const handleUpdateSender = (val: string) => {
    setSenderName(val);
    try {
      localStorage.setItem('love_letter_sender_2010', val);
    } catch {}
  };

  const handleUpdateLetterBody = (val: string) => {
    setLetterBody(val);
    try {
      localStorage.setItem('love_letter_body_2010', val);
    } catch {}
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save confirmation
      try {
        localStorage.setItem('love_letter_nickname_2010', nickname);
        localStorage.setItem('love_letter_sender_2010', senderName);
        localStorage.setItem('love_letter_body_2010', letterBody);
      } catch {}
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 3000);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Khôi phục lại lời thư gốc ban đầu? Các chỉnh sửa hiện tại sẽ được đặt lại.')) {
      setNickname(DEFAULT_NICKNAME);
      setSenderName(DEFAULT_SENDER_NAME);
      setLetterBody(DEFAULT_LETTER_BODY);
      try {
        localStorage.removeItem('love_letter_nickname_2010');
        localStorage.removeItem('love_letter_sender_2010');
        localStorage.removeItem('love_letter_body_2010');
        window.dispatchEvent(new CustomEvent('love_nickname_changed', { detail: DEFAULT_NICKNAME }));
      } catch {}
      setIsEditing(false);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 3000);
    }
  };

  const handleOpenEnvelope = () => {
    if (!isOpen) {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#ffe4e6', '#fbbf24'],
      });
    }
    onToggle();
  };

  const handleCopy = () => {
    const fullText = `Gửi ${nickname},\n\n${letterBody}\n\nThương em,\n${senderName}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="letter" className="py-16 md:py-24 bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-2 uppercase">
            <MailOpen className="w-3.5 h-3.5" />
            <span>Thư Tình 20/10</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-stone-900 tracking-tight mb-2">
            Bức Thư Gửi Riêng Cho Em
          </h2>
          <p className="text-sm text-stone-500">
            {isOpen ? 'Những lời tận đáy lòng anh muốn gửi gắm hôm nay' : 'Bức thư đang được niêm phong bằng dấu sáp tình yêu'}
          </p>
        </div>

        {/* Envelope Closed State */}
        {!isOpen ? (
          <div className="relative mx-auto max-w-lg">
            <div className="relative bg-gradient-to-br from-rose-100 via-rose-50 to-pink-100 border border-rose-200/90 rounded-3xl p-8 sm:p-12 shadow-lg text-center flex flex-col items-center justify-center min-h-[320px] transition-all duration-300 hover:shadow-xl">
              {/* Decorative Envelope Flap Lines */}
              <div
                className="absolute inset-x-0 top-0 h-32 border-b border-rose-200/70 bg-white/40 rounded-t-3xl"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                aria-hidden="true"
              />

              {/* Wax Seal Button */}
              <button
                onClick={handleOpenEnvelope}
                aria-label="Nhấn để phá dấu sáp và mở bức thư tình"
                className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white shadow-xl flex flex-col items-center justify-center p-2 group hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-rose-200/80"
              >
                <Heart className="w-8 h-8 fill-amber-200 text-amber-200 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-amber-100">
                  Mở Thư
                </span>
              </button>

              <div className="relative z-10 mt-6 text-center">
                <p className="font-serif-romantic text-lg font-bold text-rose-900">
                  Thư gửi {nickname}
                </p>
                <p className="text-xs text-rose-600 mt-1">
                  Chạm vào dấu sáp màu đỏ để mở phong bì tình yêu
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Unfolded Letter State */
          <div className="relative bg-[#fffdf9] border border-amber-200/80 rounded-3xl p-6 sm:p-12 shadow-xl animate-fade-in relative overflow-hidden">
            {/* Top vintage stamp */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              {isEditor && savedBadge && (
                <span className="animate-fade-in text-xs text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-2xs">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Đã lưu vào trình duyệt
                </span>
              )}

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-amber-200 bg-amber-50/60 text-stone-600 hover:text-stone-900 transition-colors"
                title="Sao chép toàn bộ thư"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>

              {isEditor && isEditing && (
                <button
                  onClick={handleResetDefault}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                  title="Khôi phục lại nội dung gốc ban đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục gốc</span>
                </button>
              )}

              {isEditor && (
                <button
                  onClick={handleToggleEdit}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                    isEditing
                      ? 'border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                      : 'border-amber-200 bg-amber-50/60 text-stone-600 hover:text-stone-900'
                  }`}
                  title="Tùy chỉnh nội dung thư"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu lại</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa thư</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Letter Salutation */}
            <div className="mb-6 border-b border-amber-100 pb-4">
              <span className="text-xs uppercase tracking-widest text-rose-500 font-semibold block mb-1">
                20 Tháng 10 Năm Nay & Mãi Mãi
              </span>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className="font-serif-romantic text-xl font-bold text-stone-800">Gửi:</span>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => handleUpdateNickname(e.target.value)}
                    placeholder="Biệt danh em bé..."
                    className="flex-1 font-serif-romantic text-xl font-bold text-rose-700 border-b border-rose-300 bg-transparent px-1 focus:outline-none focus:border-rose-500"
                  />
                </div>
              ) : (
                <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-stone-900">
                  Gửi <span className="text-rose-600 italic">{nickname}</span>,
                </h3>
              )}
            </div>

            {/* Letter Content */}
            {isEditing ? (
              <div>
                <textarea
                  value={letterBody}
                  onChange={(e) => handleUpdateLetterBody(e.target.value)}
                  rows={9}
                  className="w-full text-base sm:text-lg text-stone-700 leading-relaxed font-serif-romantic bg-amber-50/30 p-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
                <p className="text-[11px] text-stone-400 mt-1 italic">
                  * Mọi chỉnh sửa được tự động lưu vào trình duyệt (localStorage), không lo bị mất khi tải lại trang.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-stone-700 leading-relaxed sm:text-lg font-serif-romantic whitespace-pre-line">
                {letterBody}
              </div>
            )}

            {/* Letter Signature */}
            <div className="mt-8 pt-6 border-t border-amber-100 flex flex-col items-end">
              <span className="text-xs text-stone-500 italic mb-1">Thương em thật nhiều,</span>
              {isEditing ? (
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => handleUpdateSender(e.target.value)}
                  placeholder="Tên của bạn..."
                  className="font-handwriting text-2xl text-rose-700 border-b border-rose-300 bg-transparent text-right focus:outline-none"
                />
              ) : (
                <span className="font-handwriting text-3xl sm:text-4xl text-rose-600">
                  {senderName}
                </span>
              )}
            </div>

            {/* Fold Envelope Back Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleOpenEnvelope}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors underline"
              >
                Gấp thư và niêm phong lại
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
