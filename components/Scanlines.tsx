'use client';

export default function Scanlines() {
  return (
    <>
      {/* Scanlines */}
      <div
        className="scanlines"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9998,
          background: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)',
        }}
      />
      {/* Vignette */}
      <div
        className="vignette"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9997,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </>
  );
}
