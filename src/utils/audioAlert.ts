/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API chime / bell synthesizer for low stock alert
let audioCtx: AudioContext | null = null;
let isMuted = false;

export function setAudioMuted(muted: boolean) {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sim_atk_sound_muted', muted ? 'true' : 'false');
  }
}

export function getAudioMuted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sim_atk_sound_muted') === 'true';
  }
  return isMuted;
}

export function playAlertChime(): void {
  if (getAudioMuted()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // First bell tone (high harmonic chime - 880Hz / A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(860, now + 0.6);

    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second bell tone (warm resonance - 587.33Hz / D5, delayed slightly)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(580, now + 0.9);

    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio alert could not play:', err);
  }
}
