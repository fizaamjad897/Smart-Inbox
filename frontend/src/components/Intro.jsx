import { useEffect, useState } from 'react';

// A one-time motion-graphic intro: a black envelope focuses in, opens, and the
// letter flies up and settles at the top before the site fades in. Once per session.
export default function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return !reduced && !sessionStorage.getItem('si_intro');
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem('si_intro', '1');
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-env">
        <div className="env-body" />
        <div className="env-pocket" />
        <div className="env-flap" />
      </div>
      <div className="intro-fly">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
