import { useState, useEffect } from 'react';

interface FeedbackIconProps {
  type: 'success' | 'error';
}

export default function FeedbackIcon({ type }: FeedbackIconProps) {
  const [themeColor, setThemeColor] = useState('');
  useEffect(() => {
    setThemeColor(type === 'success' ? 'var(--success-color)' : 'var(--error-color)');
  }, [type]);

  return (
    <svg className="w-16 h-16" viewBox="0 0 24 24">
      {type === 'success' ? (
        <path fill={themeColor} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93-5.3-5.29 1.41-1.41 3.89 3.88 7.55-7.55 1.41 1.41L11 19.93z"/>
      ) : (
        <path fill={themeColor} d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm1-17h-2v2h2V5zm0 12H11v-2h2v2z"/>
      )}
    </svg>
  );
};