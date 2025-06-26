'use client';

import LiteracyGame from './LiteracyGamePage';
import { GestureCaptureProvider } from '../../components/guesture/GestureCaptureProvider';

export default function Page() {
  return <GestureCaptureProvider>
    <LiteracyGame />
  </GestureCaptureProvider>;
}