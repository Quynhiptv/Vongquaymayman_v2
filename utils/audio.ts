// Web Audio API helper to generate sounds without loading external files

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playTickSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playWinSound = () => {
  try {
    const ctx = getAudioContext();
    // Simple fanfare
    const now = ctx.currentTime;
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Major arpeggio
    playNote(523.25, now, 0.2); // C5
    playNote(659.25, now + 0.1, 0.2); // E5
    playNote(783.99, now + 0.2, 0.2); // G5
    playNote(1046.50, now + 0.3, 0.8); // C6
  } catch (e) { console.error(e); }
};

export const playSecretToggleSound = (isActive: boolean) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // High pitch for ON, Low for OFF
    osc.frequency.setValueAtTime(isActive ? 1200 : 200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(isActive ? 1500 : 100, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) { console.error(e); }
};

export const playStartSpinSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Rising pitch "whoosh"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { console.error(e); }
};

export const playStopSpinSound = () => {
  try {
    const ctx = getAudioContext();
    // Mechanical "thud" / latch sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) { console.error(e); }
};

export const speakWinnerName = (name: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Cancel any currently playing speech to avoid overlap
  window.speechSynthesis.cancel();

  const text = `Chúc mừng ${name} đã trúng thưởng!`;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Settings for a "cheerful female" vibe (approximate, depends on OS voices)
  utterance.lang = 'vi-VN';
  utterance.volume = 1;
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.2; // Higher pitch typically sounds more like a female voice

  // Try to select a specific high-quality Vietnamese voice if available
  // Browsers load voices asynchronously, but usually they are ready by the time a user spins.
  const voices = window.speechSynthesis.getVoices();
  const vnVoice = voices.find(v => v.lang.includes('vi') && (v.name.includes('Google') || v.name.includes('Female'))) || 
                  voices.find(v => v.lang.includes('vi'));

  if (vnVoice) {
    utterance.voice = vnVoice;
  }

  window.speechSynthesis.speak(utterance);
};