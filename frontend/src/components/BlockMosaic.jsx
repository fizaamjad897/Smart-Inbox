import { useEffect, useState } from 'react';
import { CATEGORIES, CATEGORY_ORDER } from '../categories.js';

const COLS = 7;
const ROWS = 6;
const CELLS = COLS * ROWS;
const PALETTE = CATEGORY_ORDER.map((k) => CATEGORIES[k].color);
const IDLE = '#ece6da';

// A living grid of tiles that light up in the category colors and fade back,
// like emails being sorted in real time.
export default function BlockMosaic() {
  const [active, setActive] = useState({});

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => {
        const next = { ...prev };
        const keys = Object.keys(next);
        // let a couple fade out
        for (let n = 0; n < 2 && keys.length; n++) {
          const k = keys[Math.floor(Math.random() * keys.length)];
          delete next[k];
        }
        // light a few up
        for (let n = 0; n < 3; n++) {
          const idx = Math.floor(Math.random() * CELLS);
          next[idx] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        }
        return next;
      });
    }, 780);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="grid gap-1.5 sm:gap-2"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: CELLS }).map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return (
          <div
            key={i}
            className="block-in aspect-square rounded-[5px] transition-colors duration-700 ease-out"
            style={{
              animationDelay: `${(col + row) * 45}ms`,
              backgroundColor: active[i] || IDLE
            }}
          />
        );
      })}
    </div>
  );
}
