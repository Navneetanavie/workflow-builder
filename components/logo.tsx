export function Logo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex size-10 items-center justify-center rounded-lg bg-gray-900 text-white ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 18V6l6 8 6-8v12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}
