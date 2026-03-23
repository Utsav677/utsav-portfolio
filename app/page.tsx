'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Scanlines from '../components/Scanlines';
import 'xterm/css/xterm.css';

// Boot sequence uses Framer Motion — no SSR issues
const BootSequence = dynamic(() => import('../components/BootSequence'), {
  ssr: false,
});

// Terminal uses xterm.js — must be client-side only
const Terminal = dynamic(() => import('../components/Terminal'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#060401',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e8a020',
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: '13px',
    }}>
      Loading terminal...
    </div>
  ),
});

export default function Home() {
  const [booted, setBooted] = useState<boolean | null>(null);
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    const alreadyBooted = localStorage.getItem('booted') === '1';
    setBooted(alreadyBooted);
    setShowBoot(!alreadyBooted);
  }, []);

  const handleBootComplete = () => {
    localStorage.setItem('booted', '1');
    setShowBoot(false);
  };

  // Don't render anything until we know if we're booted
  if (booted === null) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#060401',
      }} />
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060401' }}>
      {showBoot ? (
        <BootSequence onComplete={handleBootComplete} />
      ) : (
        <Terminal autoRunWhoami={!booted} />
      )}
      <Scanlines />
    </div>
  );
}
