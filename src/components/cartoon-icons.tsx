/** Cartoon-style SVG icons — thick outlines, round shapes, matching the site theme */

type IconProps = {
  className?: string;
  size?: number;
};

export function IconMapHeart({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Pin body */}
      <path d="M24 44L24 44C24 44 38 28 38 20C38 12.268 31.732 6 24 6C16.268 6 10 12.268 10 20C10 28 24 44 24 44Z" fill="#FDE7F3" stroke="#2C2A3A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Heart inside */}
      <path d="M24 27C24 27 17 22.5 17 18.5C17 16.5 18.5 15 20.5 15C22 15 23.2 16 24 17C24.8 16 26 15 27.5 15C29.5 15 31 16.5 31 18.5C31 22.5 24 27 24 27Z" fill="#F9C7A7" stroke="#2C2A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPeopleHands({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Person left */}
      <circle cx="16" cy="14" r="5" fill="#DFF3FF" stroke="#2C2A3A" strokeWidth="3"/>
      <path d="M8 36V30C8 26.686 10.686 24 14 24H18C21.314 24 24 26.686 24 30V36" fill="#DFF3FF" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round"/>
      {/* Person right */}
      <circle cx="32" cy="14" r="5" fill="#D9F7E8" stroke="#2C2A3A" strokeWidth="3"/>
      <path d="M24 36V30C24 26.686 26.686 24 30 24H34C37.314 24 40 26.686 40 30V36" fill="#D9F7E8" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round"/>
      {/* Heart between */}
      <path d="M24 22C24 22 21 19.5 21 17.8C21 16.8 21.8 16 22.8 16C23.5 16 24 16.5 24 16.5C24 16.5 24.5 16 25.2 16C26.2 16 27 16.8 27 17.8C27 19.5 24 22 24 22Z" fill="#F9C7A7" stroke="#2C2A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconShieldCheck({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Shield */}
      <path d="M24 6L8 14V24C8 34 15 41.5 24 44C33 41.5 40 34 40 24V14L24 6Z" fill="#B9F1C2" stroke="#2C2A3A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Checkmark */}
      <path d="M16 24L22 30L34 18" stroke="#2C2A3A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconStar({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 6L29.5 17.5L42 19.5L33 28.5L35 41L24 35L13 41L15 28.5L6 19.5L18.5 17.5L24 6Z" fill="#FFF4C2" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconHandshake({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Left hand */}
      <path d="M6 20L14 14L22 20L18 26L24 30" fill="#E9E0FF" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right hand */}
      <path d="M42 20L34 14L26 20L30 26L24 30" fill="#D9F7E8" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Handshake center */}
      <path d="M18 26L24 30L30 26" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Sparkle */}
      <circle cx="24" cy="10" r="2" fill="#FFF4C2" stroke="#2C2A3A" strokeWidth="2"/>
      <circle cx="14" cy="36" r="1.5" fill="#FDE7F3" stroke="#2C2A3A" strokeWidth="1.5"/>
      <circle cx="34" cy="36" r="1.5" fill="#DFF3FF" stroke="#2C2A3A" strokeWidth="1.5"/>
    </svg>
  );
}

export function IconClipboard({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Board */}
      <rect x="10" y="10" width="28" height="32" rx="4" fill="#FFE5D3" stroke="#2C2A3A" strokeWidth="3"/>
      {/* Clip top */}
      <rect x="18" y="6" width="12" height="8" rx="3" fill="#DFF3FF" stroke="#2C2A3A" strokeWidth="3"/>
      {/* Lines */}
      <line x1="16" y1="22" x2="32" y2="22" stroke="#2C2A3A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="28" x2="28" y2="28" stroke="#2C2A3A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="34" x2="24" y2="34" stroke="#2C2A3A" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconWarning({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 6L42 40H6L24 6Z" fill="#FFF4C2" stroke="#2C2A3A" strokeWidth="3" strokeLinejoin="round"/>
      <line x1="24" y1="20" x2="24" y2="30" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="24" cy="35" r="1.5" fill="#2C2A3A"/>
    </svg>
  );
}

export function IconQuestion({ className = "", size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="18" fill="#DFF3FF" stroke="#2C2A3A" strokeWidth="3.5"/>
      <path d="M18 18C18 14.7 20.7 12 24 12C27.3 12 30 14.7 30 18C30 21.3 27 22 25 24V28" stroke="#2C2A3A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="25" cy="34" r="2" fill="#2C2A3A"/>
    </svg>
  );
}
