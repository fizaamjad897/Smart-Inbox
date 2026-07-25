export default function Logo({ className = 'h-7 w-7' }) {
  return (
    <span className={`si-logo grid place-items-center rounded-lg bg-ink ${className}`}>
      <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" aria-hidden="true">
        <path
          d="M20 34 L50 56 L80 34"
          fill="none"
          stroke="#f6f4ef"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
