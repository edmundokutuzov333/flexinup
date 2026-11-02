export function Glitch({ text, className = "", active = false, as: Tag = "span" }: { text: string; className?: string; active?: boolean; as?: "span" | "h1" | "h2" }) {
  return (
    <Tag data-text={text} className={`glitch ${active ? "is-glitching" : ""} ${className}`}>
      {text}
    </Tag>
  );
}

export function Star4({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      <path d="M12 0 C13 9 15 11 24 12 C15 13 13 15 12 24 C11 15 9 13 0 12 C9 11 11 9 12 0Z" fill="currentColor" />
    </svg>
  );
}

export function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 30" aria-hidden className={className}>
      <path d="M8 0h4v9h8v4h-8v17H8V13H0V9h8z" fill="currentColor" />
    </svg>
  );
}
