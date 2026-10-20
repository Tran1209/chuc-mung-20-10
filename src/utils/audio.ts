// Romantic Audio Engine supporting "Nơi Này Có Anh (Sơn Tùng M-TP)"
// and custom user MP3 / audio file playback

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackIndex = 0;
  private volume = 0.75;
  private audioElement: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = './music.m4a';

  private tracks = [
    {
      id: 'noi-nay-co-anh',
      name: 'Nơi Này Có Anh (Sơn Tùng M-TP)',
      subtitle: 'Cầm tay anh, tựa vai anh...',
      tempo: 102,
      // Chord arpeggio progression for "Nơi Này Có Anh" (F, C/E, Dm7, Am7, Bb, F/A, Gm7, C7)
      chords: [
        [174.61, 261.63, 349.23, 440.00], // F major (F3, C4, F4, A4)
        [164.81, 261.63, 329.63, 392.00], // C/E (E3, C4, E4, G4)
        [146.83, 220.00, 261.63, 349.23], // Dm7 (D3, A3, C4, F4)
        [110.00, 220.00, 261.63, 329.63], // Am7 (A2, A3, C4, E4)
        [116.54, 233.08, 293.66, 349.23], // Bbmaj7 (Bb2, Bb3, D4, F4)
        [110.00, 174.61, 220.00, 261.63], // F/A (A2, F3, A3, C4)
        [98.00, 196.00, 233.08, 293.66],  // Gm7 (G2, G3, Bb3, D4)
        [130.81, 196.00, 261.63, 349.23], // C7sus4 (C3, G3, C4, F4)
      ],
      // Iconic chorus lead melody ("Cầm tay anh, tựa vai anh... Nơi này có anh")
      leadNotes: [
        523.25, // C5 ("Cầm tay")
        440.00, // A4 ("anh")
        349.23, // F4 ("tựa vai")
        523.25, // C5 ("anh")
        466.16, // Bb4 ("ngắm")
        440.00, // A4 ("đôi")
        392.00, // G4 ("mi")
        349.23, // F4 ("cong")
        440.00, // A4 ("Nơi")
        523.25, // C5 ("này")
        587.33, // D5 ("có")
        523.25, // C5 ("anh")
      ]
    },
    {
      id: 'mot-doi',
      name: 'Một Đời (14 Casper & Bon)',
      subtitle: 'Một đời này thương em...',
      tempo: 82,
      chords: [
        [174.61, 261.63, 349.23, 440.00], // F major
        [164.81, 261.63, 329.63, 392.00], // C/E
        [146.83, 220.00, 261.63, 349.23], // D minor 7
        [110.00, 220.00, 261.63, 329.63], // A minor 7
        [116.54, 233.08, 293.66, 349.23], // Bb major 7
        [110.00, 174.61, 220.00, 261.63], // F/A
        [98.00, 196.00, 233.08, 293.66],  // G minor 7
        [130.81, 196.00, 261.63, 392.00], // C major
      ],
      leadNotes: [349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 329.63]
    },
    {
      id: 'canon',
      name: 'Bản Tình Ca 20/10',
      subtitle: 'Canon Dịu Dàng',
      tempo: 92,
      chords: [
        [261.63, 329.63, 392.00, 523.25], // C major
        [196.00, 246.94, 293.66, 392.00], // G major
        [220.00, 261.63, 329.63, 440.00], // A minor
        [164.81, 196.00, 246.94, 329.63], // E minor
        [174.61, 220.00, 261.63, 349.23], // F major
        [261.63, 329.63, 392.00, 523.25], // C major
        [174.61, 220.00, 261.63, 349.23], // F major
        [196.00, 246.94, 293.66, 392.00], // G major
      ],
      leadNotes: [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 392.00]
    }
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, duration: number = 1.2, delay: number = 0, isLead = false) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = isLead ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    const now = this.ctx.currentTime + delay;
    const peakGain = isLead ? 0.38 : 0.22;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.035);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  public setCustomAudio(url: string | null) {
    this.customAudioUrl = url;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (url) {
      this.audioElement = new Audio(url);
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume;
      if (this.isPlaying) {
        this.pauseSynth();
        this.audioElement.play().catch(() => {
          this.playSynth();
        });
      }
    } else {
      if (this.isPlaying) {
        this.playSynth();
      }
    }
  }

  public hasCustomAudio(): boolean {
    return !!this.customAudioUrl;
  }

  private playSynth() {
    this.initContext();
    const track = this.tracks[this.currentTrackIndex];
    let stepIdx = 0;
    const stepDuration = 60 / track.tempo;

    const loop = () => {
      if (!this.isPlaying || this.customAudioUrl) return;
      const currentChord = track.chords[stepIdx % track.chords.length];

      // Play soft arpeggiation with warm acoustic rhythm
      currentChord.forEach((freq, noteIdx) => {
        this.playTone(freq, stepDuration * 2.0, noteIdx * (stepDuration / 2));
      });

      // Play lead motif note
      if (track.leadNotes && track.leadNotes[stepIdx % track.leadNotes.length]) {
        this.playTone(
          track.leadNotes[stepIdx % track.leadNotes.length],
          stepDuration * 1.5,
          stepDuration * 0.4,
          true
        );
      }

      stepIdx = (stepIdx + 1) % track.chords.length;
      this.timerId = window.setTimeout(loop, stepDuration * 2 * 1000);
    };

    loop();
  }

  private pauseSynth() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public play() {
    this.isPlaying = true;

    if (this.customAudioUrl) {
      if (!this.audioElement) {
        this.audioElement = new Audio(this.customAudioUrl);
        this.audioElement.loop = true;
      }
      this.audioElement.volume = this.volume;
      this.audioElement.play().catch(() => {
        this.playSynth();
      });
    } else {
      this.playSynth();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.pauseSynth();
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public nextTrack(): string {
    if (this.customAudioUrl) {
      this.customAudioUrl = null;
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement = null;
      }
    }
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
    return this.tracks[this.currentTrackIndex].name;
  }

  public getTrackName(): string {
    if (this.customAudioUrl) {
      return 'Nơi Này Có Anh (Bản MP3 tải lên)';
    }
    return this.tracks[this.currentTrackIndex].name;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const romanticAudio = new RomanticAudioEngine();
