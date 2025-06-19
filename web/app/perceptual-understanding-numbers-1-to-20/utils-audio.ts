"use client";
import * as Tone from 'tone';

let audioInitialized = false;

export const initAudio = async () => {
  if (!audioInitialized) {
    try {
      await Tone.start();
      audioInitialized = true;
      console.log('Audio is ready');
    } catch (error) {
      console.error('Error initializing audio:', error);
      // Handle error, e.g., inform the user that audio features might be disabled.
    }
  }
};

// Helper to ensure audio is initialized before playing
const ensureAudioInitialized = async () => {
  if (!audioInitialized) {
    await initAudio();
  }
  // If still not initialized after trying, maybe return early or throw error
  if (!audioInitialized) {
    console.warn('Audio context not available. Cannot play sound.');
    return false;
  }
  return true;
};

export const playClickSound = async () => {
  if (!await ensureAudioInitialized()) return;
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C5", "8n");
};

export const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

export const playDing = async () => {
  if (!await ensureAudioInitialized()) return;
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("E5", "8n");
};

export const playError = async () => {
  if (!await ensureAudioInitialized()) return;
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C3", "4n");
};

export const playJudgmentSound = async () => {
  if (!await ensureAudioInitialized()) return;
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("G4", "2n", Tone.now() + 0.5);
};

export const playErrorVibration = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]); // Vibrate pattern for error
  }
};

export const playCollisionSound = async ({ velocity, position }) => {
  if (!await ensureAudioInitialized()) return;
  const synth = new Tone.Synth().toDestination();
  // Adjust frequency based on velocity for a more dynamic sound
  const frequency = Tone.Frequency(Math.max(100, Math.min(1000, velocity * 100))).toFrequency();
  synth.triggerAttackRelease(frequency, '16n', Tone.now(), 0.5);
};

export const playEnergyBallSound = async (type: string, options: { velocity?: number; position?: [number, number] }) => {
  if (!await ensureAudioInitialized()) return;
  const synth = new Tone.Synth().toDestination();
  if (type === 'collision' && options.velocity && options.position) {
    const frequency = Tone.Frequency(Math.max(100, Math.min(1000, options.velocity * 100))).toFrequency();
    synth.triggerAttackRelease(frequency, '16n', Tone.now(), 0.5);
  }
};

// Export initAudio to be called from elsewhere if needed
export { initAudio };
