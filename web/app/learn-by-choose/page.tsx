'use client';

import LiteracyGame from './LiteracyGamePage';
import { GestureCaptureProvider } from '../../components/guesture/GestureCaptureProvider';

export default function Page() {
  return <GestureCaptureProvider enable={false}>
    <LiteracyGame />
  </GestureCaptureProvider>;
}