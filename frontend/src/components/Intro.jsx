import { useLayoutEffect, useEffect, useState } from 'react';

// One-time motion-graphic intro: a black envelope opens, the letter becomes a
// paper plane that arcs up and lands on the navbar logo, then the site reveals.
export default function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return !reduced && !sessionStorage.getItem('si_intro');
  });
  const [target, setTarget] = useState({ x: 56, y: 34 });

  // Measure the real logo position so the plane lands on it (any viewport).
  useLayoutEffect(() => {
    if (!show) return;
    const el = document.querySelector('.si-logo');
    if (el) {
      const r = el.getBoundingClientRect();
      setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem('si_intro', '1');
    const t = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-bg" />
      <div className="intro-env">
        <div className="env-body" />
        <div className="env-pocket" />
        <div className="env-flap" />
      </div>
      <div className="intro-plane" style={{ '--tx': `${target.x}px`, '--ty': `${target.y}px` }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 2 L9 22 L13 13 L22 9 Z" fill="#f6f4ef" />
          <path d="M2 2 L13 13 L9 22 Z" fill="#cfc8b9" />
        </svg>
      </div>
    </div>
  );
}
