/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { PetalCanvas } from './components/PetalCanvas.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MemoryGallery } from './components/MemoryGallery.tsx';
import { LoveLetter } from './components/LoveLetter.tsx';
import { ReasonsDeck } from './components/ReasonsDeck.tsx';
import { SurpriseGift } from './components/SurpriseGift.tsx';
import { MusicPlayer } from './components/MusicPlayer.tsx';
import { Footer } from './components/Footer.tsx';
import { romanticAudio } from './utils/audio.ts';
import { getAllPhotosFromDB, getPhotoFromDB } from './utils/storage.ts';
import { INITIAL_MEMORIES } from './data/memories.ts';

export default function App() {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(true);
  const [trackName, setTrackName] = useState<string>(() => {
    try {
      return localStorage.getItem('romantic_track_name_2010') || romanticAudio.getTrackName();
    } catch {
      return romanticAudio.getTrackName();
    }
  });
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.'));

  const handleSyncToGithub = async () => {
    setIsSyncing(true);
    setSyncStatus('Đang gom ảnh & dữ liệu...');
    try {
      const photosMap = await getAllPhotosFromDB();
      const storedMemories = localStorage.getItem('love_memories_metadata_2010');
      let baseMemories = storedMemories ? JSON.parse(storedMemories) : [];

      const fullMemories = INITIAL_MEMORIES.map((initCard) => {
        const found = baseMemories.find((b: any) => b.id === initCard.id);
        const merged = found ? { ...initCard, ...found } : { ...initCard };
        if (photosMap[merged.id]) {
          merged.customImageData = photosMap[merged.id];
        }
        if (photosMap[merged.originalFileName]) {
          merged.customImageData = photosMap[merged.originalFileName];
        }
        return merged;
      });

      const nickname = localStorage.getItem('love_letter_nickname_2010');
      const senderName = localStorage.getItem('love_letter_sender_2010');
      const letterBody = localStorage.getItem('love_letter_body_2010');
      const herName = localStorage.getItem('love_hero_her_name_2010');
      const anniversaryDate = localStorage.getItem('anniversary_date_2010');
      const customSongData = await getPhotoFromDB('custom_song_noi_nay_co_anh');

      setSyncStatus('Đang đóng gói và đẩy lên GitHub Pages...');

      const res = await fetch('/api/sync-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memories: fullMemories,
          nickname,
          senderName,
          letterBody,
          herName,
          anniversaryDate,
          customSongData,
        }),
      });

      if (!res.ok) throw new Error('Sync failed');
      setSyncStatus('✓ ĐÃ ĐỒNG BỘ XONG! Mở điện thoại lên là thấy 100%!');
      setTimeout(() => setSyncStatus(''), 7000);
    } catch (err) {
      console.error(err);
      setSyncStatus('Lỗi đồng bộ. Vui lòng thử lại!');
      setTimeout(() => setSyncStatus(''), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Autoplay music on site open (with fallback for browser autoplay policies)
  useEffect(() => {
    romanticAudio.play();
    setIsPlayingMusic(true);

    const handleFirstTouch = () => {
      romanticAudio.play();
      setIsPlayingMusic(true);
    };

    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    window.addEventListener('scroll', handleFirstTouch, { once: true });
    window.addEventListener('keydown', handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('scroll', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
  }, []);

  const toggleMusic = () => {
    const nextState = romanticAudio.toggle();
    setIsPlayingMusic(nextState);
    const currentName = romanticAudio.getTrackName();
    setTrackName(currentName);
    try {
      localStorage.setItem('romantic_track_name_2010', currentName);
    } catch {}
  };

  const handleOpenLetter = () => {
    setIsLetterOpen(true);
    const letterElem = document.getElementById('letter');
    if (letterElem) {
      letterElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-rose-50/40 text-stone-800">
      {/* Localhost Sync Toolbar */}
      {isLocalhost && (
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white py-2 px-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg sticky top-0 z-50 animate-fade-in border-b border-rose-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">✨ Quản Trị Máy Tính</span>
            <span className="font-medium">
              Chỉnh sửa xong ảnh, nhạc hay lời thư trên máy? Nhấn nút bên cạnh để đẩy đồng bộ ngay sang điện thoại:
            </span>
          </div>
          <button
            onClick={handleSyncToGithub}
            disabled={isSyncing}
            className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isSyncing
                ? 'bg-amber-300 text-amber-950 animate-pulse'
                : 'bg-white text-rose-600 hover:bg-rose-50 hover:scale-105 active:scale-95'
            }`}
          >
            {isSyncing ? (
              <span>⏳ {syncStatus}</span>
            ) : syncStatus ? (
              <span>{syncStatus}</span>
            ) : (
              <span>🚀 ĐỒNG BỘ LÊN ĐIỆN THOẠI NGAY</span>
            )}
          </button>
        </div>
      )}

      {/* Interactive ambient falling rose petals & sparkles */}
      <PetalCanvas />

      {/* Strict 3-zone Top Bar Contract */}
      <Navbar
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={toggleMusic}
        trackName={trackName}
      />

      {/* Main Content Sections */}
      <main className="flex-1 z-20 pb-20 sm:pb-12">
        <HeroSection onOpenLetter={handleOpenLetter} />
        <MemoryGallery />
        <LoveLetter
          isOpen={isLetterOpen}
          onToggle={() => setIsLetterOpen(!isLetterOpen)}
        />
        <ReasonsDeck />
        <SurpriseGift />
      </main>

      {/* Floating Music Player */}
      <MusicPlayer
        isPlaying={isPlayingMusic}
        onToggle={toggleMusic}
        trackName={trackName}
        onTrackChange={(newTrack) => {
          setTrackName(newTrack);
          try {
            localStorage.setItem('romantic_track_name_2010', newTrack);
          } catch {}
          setIsPlayingMusic(true);
        }}
      />

      {/* Quiet, clean romantic footer */}
      <Footer />
    </div>
  );
}
