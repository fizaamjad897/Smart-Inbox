import { useEffect, useState } from 'react';

// A one-time intro: a black envelope opens, the letter rises, then the two
// black panels split apart to reveal the site. Shows once per browser session.
export default function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return !reduced && !sessionStorage.getItem('si_intro');
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem('si_intro', '1');
    const t = setTimeout(() => setShow(false), 2100);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-panel intro-top" />
      <div className="intro-panel intro-bottom" />
      <div className="intro-center">
        <div className="env">
          <div className="env-body" />
          <div className="env-letter">
            <span />
            <span />
            <span />
          </div>
          <div className="env-pocket" />
          <div className="env-flap" />
        </div>
        <div className="intro-word">Smart Inbox</div>
      </div>
    </div>
  );
}
