"use client";
import * as Tone from 'tone';

const synth = new Tone.Synth().toDestination();
const panner = new Tone.Panner(0.5).toDestination();

const playSound = (type: 'add' | 'remove' | 'correct' | 'incorrect') => {
  const now = Tone.now();
  switch(type) {
    case 'add':
      synth.triggerAttackRelease('C5', '8n', now);
      break;
    case 'remove':
      synth.triggerAttackRelease('E4', '8n', now);
      break;
    case 'correct':
      synth.triggerAttackRelease(['C5', 'E5', 'G5'], '4n', now);
      break;
    case 'incorrect':
      synth.triggerAttackRelease('C3', '4n', now);
      break;
  }
};

export const initAudio = async () => {
  await Tone.start();
  console.log('Audio is ready');
};

export default playSound;