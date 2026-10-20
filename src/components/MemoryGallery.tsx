import React, { useState, useEffect, useRef } from 'react';
import { Heart, Search, Upload, X, ZoomIn, Camera, Sparkles, ImagePlus, Edit3, Check, RotateCcw } from 'lucide-react';
import { MemoryCard } from '../types/index.ts';
import { INITIAL_MEMORIES } from '../data/memories.ts';
import { filterMemories } from '../utils/rules.ts';
import { savePhotoToDB, getAllPhotosFromDB, clearAllPhotosDB } from '../utils/storage.ts';
import confetti from 'canvas-confetti';

interface MemoryGalleryProps {
  onSelectPhoto?: (card: MemoryCard) => void;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = () => {
  // Load metadata from localStorage if previously edited
  const [memories, setMemories] = useState<MemoryCard[]>(() => {
    try {
      const stored = localStorage.getItem('love_memories_metadata_2010');
      if (stored) {
        const parsed: Partial<MemoryCard>[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial memories to keep image defaults intact
          return INITIAL_MEMORIES.map((initCard) => {
            const found = parsed.find((p) => p.id === initCard.id);
            return found ? { ...initCard, ...found } : initCard;
          });
        }
      }
    } catch {}
    return INITIAL_MEMORIES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalCard, setActiveModalCard] = useState<MemoryCard | null>(null);
  const [isEditingModal, setIsEditingModal] = useState<boolean>(false);
  const [modalEditTitle, setModalEditTitle] = useState<string>('');
  const [modalEditCaption, setModalEditCaption] = useState<string>('');
  const [modalEditDate, setModalEditDate] = useState<string>('');
  const [modalEditTag, setModalEditTag] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const singleCardInputRef = useRef<HTMLInputElement | null>(null);
  const [targetCardIdForUpload, setTargetCardIdForUpload] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Helper to persist only lightweight metadata into localStorage (prevent quota exceed)
  const persistMemoriesMetadata = (list: MemoryCard[]) => {
    try {
      const metaOnly = list.map(({ id, title, caption, dateStr, tag, sticker, likes }) => ({
        id,
        title,
        caption,
        dateStr,
        tag,
        sticker,
        likes,
      }));
      localStorage.setItem('love_memories_metadata_2010', JSON.stringify(metaOnly));
    } catch (e) {
      console.warn('Could not save metadata to localStorage', e);
    }
  };

  // Load any saved photos from IndexedDB on initial mount
  useEffect(() => {
    getAllPhotosFromDB().then((savedMap) => {
      if (Object.keys(savedMap).length > 0) {
        setMemories((prev) =>
          prev.map((item) => {
            if (savedMap[item.id]) {
              return { ...item, customImageData: savedMap[item.id] };
            }
            if (savedMap[item.originalFileName]) {
              return { ...item, customImageData: savedMap[item.originalFileName] };
            }
            return item;
          })
        );
      }
    });
  }, []);

  const resolveImageSrc = (card: MemoryCard): string => {
    if (card.customImageData) return card.customImageData;
    if (card.imageUrl) {
      return card.imageUrl.startsWith('/') ? '.' + card.imageUrl : card.imageUrl;
    }
    return `./${card.originalFileName}`;
  };

  const filteredList = filterMemories(memories, selectedCategory, searchQuery);

  const categories = [
    { id: 'all', label: 'Tất Cả (11)' },
    { id: 'Đáng yêu', label: 'Đáng Yêu' },
    { id: 'Rạng rỡ', label: 'Rạng Rỡ' },
    { id: 'Dịu dàng', label: 'Dịu Dàng' },
    { id: 'Thanh xuân', label: 'Thanh Xuân' },
    { id: 'Bình yên', label: 'Bình Yên' },
  ];

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = memories.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item));
    setMemories(updated);
    persistMemoriesMetadata(updated);

    if (activeModalCard && activeModalCard.id === id) {
      setActiveModalCard({ ...activeModalCard, likes: activeModalCard.likes + 1 });
    }

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 15,
      spread: 40,
      origin: {
        x: rect.left / window.innerWidth,
        y: rect.top / window.innerHeight,
      },
      colors: ['#f43f5e', '#fb7185', '#fda4af'],
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const updated = [...memories];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const dataUrl = await readFileAsDataUrl(file);

      const matchIndex = updated.findIndex(
        (m) =>
          m.originalFileName.toLowerCase() === file.name.toLowerCase() ||
          file.name.toLowerCase().includes(m.originalFileName.toLowerCase()) ||
          m.originalFileName.toLowerCase().includes(file.name.toLowerCase())
      );

      const targetIdx = matchIndex !== -1 ? matchIndex : i % updated.length;
      updated[targetIdx] = {
        ...updated[targetIdx],
        customImageData: dataUrl,
      };

      await savePhotoToDB(updated[targetIdx].id, dataUrl);
      await savePhotoToDB(file.name, dataUrl);
    }

    setMemories(updated);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleSingleUpload = (cardId: string) => {
    setTargetCardIdForUpload(cardId);
    if (singleCardInputRef.current) {
      singleCardInputRef.current.click();
    }
  };

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetCardIdForUpload) return;

    const dataUrl = await readFileAsDataUrl(file);
    const updated = memories.map((item) =>
      item.id === targetCardIdForUpload ? { ...item, customImageData: dataUrl } : item
    );
    setMemories(updated);

    await savePhotoToDB(targetCardIdForUpload, dataUrl);
    await savePhotoToDB(file.name, dataUrl);

    if (activeModalCard && activeModalCard.id === targetCardIdForUpload) {
      setActiveModalCard({ ...activeModalCard, customImageData: dataUrl });
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const openModal = (card: MemoryCard) => {
    setActiveModalCard(card);
    setIsEditingModal(false);
    setModalEditTitle(card.title);
    setModalEditCaption(card.caption);
    setModalEditDate(card.dateStr);
    setModalEditTag(card.tag);
  };

  const handleSaveModalEdit = () => {
    if (!activeModalCard) return;
    const updated = memories.map((m) =>
      m.id === activeModalCard.id
        ? {
            ...m,
            title: modalEditTitle || m.title,
            caption: modalEditCaption || m.caption,
            dateStr: modalEditDate || m.dateStr,
            tag: modalEditTag || m.tag,
          }
        : m
    );
    setMemories(updated);
    persistMemoriesMetadata(updated);
    setActiveModalCard({
      ...activeModalCard,
      title: modalEditTitle || activeModalCard.title,
      caption: modalEditCaption || activeModalCard.caption,
      dateStr: modalEditDate || activeModalCard.dateStr,
      tag: modalEditTag || activeModalCard.tag,
    });
    setIsEditingModal(false);
  };

  const handleResetAllAlbum = async () => {
    if (window.confirm('Khôi phục toàn bộ Album về mặc định ban đầu? Các ảnh tải lên và chú thích tự sửa sẽ được xóa.')) {
      try {
        localStorage.removeItem('love_memories_metadata_2010');
        await clearAllPhotosDB();
      } catch {}
      setMemories(INITIAL_MEMORIES);
      if (activeModalCard) {
        const found = INITIAL_MEMORIES.find((m) => m.id === activeModalCard.id);
        setActiveModalCard(found || null);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const getTagColorClass = (tag: string) => {
    switch (tag) {
      case 'Đáng yêu':
        return 'from-pink-100 via-rose-50 to-pink-100 text-pink-700';
      case 'Rạng rỡ':
        return 'from-amber-100 via-yellow-50 to-orange-100 text-amber-700';
      case 'Dịu dàng':
        return 'from-rose-100 via-red-50 to-rose-100 text-rose-700';
      case 'Thanh xuân':
        return 'from-sky-100 via-blue-50 to-indigo-100 text-sky-700';
      case 'Bình yên':
        return 'from-emerald-100 via-teal-50 to-green-100 text-emerald-700';
      default:
        return 'from-rose-100 via-pink-50 to-rose-100 text-rose-700';
    }
  };

  return (
    <section
      id="memories"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`py-16 md:py-24 bg-white/60 border-t border-b border-rose-100/60 transition-colors relative ${
        isDragging ? 'bg-rose-100/40 ring-4 ring-rose-400 ring-inset' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Drag overlay notice */}
        {isDragging && (
          <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-xs z-30 flex items-center justify-center pointer-events-none">
            <div className="p-6 rounded-3xl bg-white shadow-2xl border-2 border-rose-400 flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-rose-500 animate-bounce" />
              <span className="font-serif-romantic text-lg font-bold text-rose-900">
                Thả ảnh vào đây để lưu ngay vào Album kỷ niệm
              </span>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-2 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Album Kỷ Niệm 20/10</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-stone-900 tracking-tight mb-3">
            11 Khoảnh Khắc Của Em Bé
          </h2>
          <p className="text-sm text-stone-600">
            Mỗi bức ảnh là một mẩu chuyện ngọt ngào, lưu giữ nụ cười và nét đáng yêu khiến anh say đắm.
          </p>
        </div>

        {/* Filter Bar & Search & Upload Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Segmented Category Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-rose-100/60 rounded-2xl">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-white text-rose-700 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box & Batch Upload Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm khoảnh khắc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-rose-200/80 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              title="Chọn ảnh từ máy để nạp vào album"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Nạp ảnh từ máy</span>
            </button>

            <button
              onClick={handleResetAllAlbum}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              title="Khôi phục album về ảnh và chú thích ban đầu"
            >
              <RotateCcw className="w-3 h-3 text-stone-500" />
              <span className="hidden sm:inline">Khôi phục gốc</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleBatchUpload}
            />
            <input
              ref={singleCardInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSingleFileChange}
            />
          </div>
        </div>

        {/* Polaroid Scrapbook Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredList.map((card) => {
            const imgSrc = resolveImageSrc(card);
            const tagColor = getTagColorClass(card.tag);

            return (
              <div
                key={card.id}
                onClick={() => openModal(card)}
                style={{
                  transform: `rotate(${card.rotationDeg}deg)`,
                }}
                className="group relative bg-white p-3.5 pb-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-rose-100/80 cursor-pointer flex flex-col justify-between"
              >
                {/* Washi tape visual styling */}
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-rose-200/60 backdrop-blur-xs border-dashed border-rose-300/60 rounded-xs pointer-events-none z-10"
                  aria-hidden="true"
                />

                {/* Photo frame */}
                <div className="relative aspect-[3/4] w-full bg-stone-100 rounded-xl overflow-hidden mb-3 border border-stone-200/50">
                  <img
                    src={imgSrc}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Fallback container with customized cute artistic postcard styling */}
                  <div
                    style={{ display: card.customImageData ? 'none' : 'none' }}
                    className={`absolute inset-0 bg-gradient-to-br ${tagColor} flex flex-col items-center justify-between p-4 text-center`}
                  >
                    <div className="w-full flex justify-end">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 shadow-2xs font-medium">
                        {card.tag}
                      </span>
                    </div>

                    <div className="flex flex-col items-center my-auto">
                      <span className="text-4xl mb-2 drop-shadow-xs">{card.sticker}</span>
                      <span className="font-serif-romantic font-bold text-stone-800 text-sm leading-snug px-2">
                        {card.title}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-1 font-mono truncate max-w-[140px]">
                        {card.originalFileName}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSingleUpload(card.id);
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-white/80 hover:bg-white text-stone-700 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Camera className="w-3 h-3 text-rose-500" />
                      <span>Chọn ảnh từ máy</span>
                    </button>
                  </div>

                  {/* Overlay badge with sticker and tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-medium text-rose-700 shadow-2xs">
                    {card.sticker} {card.tag}
                  </div>

                  {/* Quick replace button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleUpload(card.id);
                    }}
                    title="Cập nhật hoặc tải ảnh cho thẻ này"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white shadow-2xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute inset-0 bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-medium text-stone-800 flex items-center gap-1 shadow-sm">
                      <ZoomIn className="w-3.5 h-3.5 text-rose-500" />
                      Phóng to
                    </span>
                  </div>
                </div>

                {/* Card caption info */}
                <div>
                  <h3 className="font-serif-romantic font-bold text-stone-900 text-sm truncate mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {card.caption}
                  </p>
                  <div className="mt-2.5 text-[11px] text-stone-500 flex items-center justify-between">
                    <span className="font-medium text-rose-600">{card.dateStr}</span>
                    <span className="text-stone-400">#{card.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-16 text-stone-500 text-sm">
            Không tìm thấy khoảnh khắc nào phù hợp với &quot;{searchQuery}&quot;.
          </div>
        )}

        {/* Modal Lightbox for High-Res View */}
        {activeModalCard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setActiveModalCard(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalCard(null)}
                aria-label="Đóng cửa sổ"
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[4/3] w-full bg-stone-100 rounded-2xl overflow-hidden mb-5 border border-stone-200">
                <img
                  src={resolveImageSrc(activeModalCard)}
                  alt={activeModalCard.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-stone-950"
                />
              </div>

              {isEditingModal ? (
                /* Modal Editing State */
                <div className="space-y-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-200/80 mb-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                      Chỉnh sửa thông tin khoảnh khắc
                    </span>
                    <span className="text-[11px] text-stone-500">Tự động lưu vào trình duyệt</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Tên / Tiêu đề ảnh:
                    </label>
                    <input
                      type="text"
                      value={modalEditTitle}
                      onChange={(e) => setModalEditTitle(e.target.value)}
                      placeholder="VD: Bé yêu nụ cười tỏa nắng..."
                      className="w-full text-sm font-semibold px-3 py-1.5 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Lời tâm sự / Chú thích:
                    </label>
                    <textarea
                      rows={3}
                      value={modalEditCaption}
                      onChange={(e) => setModalEditCaption(e.target.value)}
                      placeholder="Lời nhắn ngọt ngào dành cho bức ảnh..."
                      className="w-full text-xs text-stone-700 px-3 py-2 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        Dòng chữ nhỏ (Dịp kỷ niệm / Ngày):
                      </label>
                      <input
                        type="text"
                        value={modalEditDate}
                        onChange={(e) => setModalEditDate(e.target.value)}
                        placeholder="VD: 18/06/2023 hoặc Khoảnh khắc đáng yêu"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        Chủ đề:
                      </label>
                      <select
                        value={modalEditTag}
                        onChange={(e) => setModalEditTag(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-white border border-rose-200 rounded-xl focus:outline-none"
                      >
                        <option value="Đáng yêu">Đáng yêu</option>
                        <option value="Rạng rỡ">Rạng rỡ</option>
                        <option value="Dịu dàng">Dịu dàng</option>
                        <option value="Thanh xuân">Thanh xuân</option>
                        <option value="Bình yên">Bình yên</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingModal(false)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveModalEdit}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu thông tin</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Modal Normal Display State */
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{activeModalCard.sticker}</span>
                      <h3 className="font-serif-romantic text-xl font-bold text-stone-900">
                        {activeModalCard.title}
                      </h3>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed mt-2">
                      {activeModalCard.caption}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 mt-3">
                      <span className="font-medium text-stone-600">{activeModalCard.dateStr}</span>
                      <span>·</span>
                      <span className="text-rose-600 font-medium">#{activeModalCard.tag}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setIsEditingModal(true)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer flex-1 sm:flex-initial"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa tên & dòng chữ nhỏ</span>
                    </button>

                    <button
                      onClick={() => handleSingleUpload(activeModalCard.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer flex-1 sm:flex-initial"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Đổi ảnh khác</span>
                    </button>
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
