import * as Tone from 'tone';
const audioPool = {
  maxPoolSize: 5,
  activeSounds: new Set<Tone.TonePart>(),
  getSound: () => {
    // 实现对象池逻辑
    return new Tone.Synth().toDestination();
  }
};
export const playSound = (type: 'add' | 'remove') => {
  const synth = audioPool.getSound();
  const freq = type === 'add' ? 440 * 1.2 : 440 * 0.8;
  synth.frequency.value = freq;
  synth.start();
  synth.stop('+0.2');
};