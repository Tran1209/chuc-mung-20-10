/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

export default function App() {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [trackName, setTrackName] = useState<string>(() => {
    try {
      return localStorage.getItem('romantic_track_name_2010') || romanticAudio.getTrackName();
    } catch {
      return romanticAudio.getTrackName();
    }
  });
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);

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
