interface GhostIconProps {
  className?: string;
  size?: number;
  outline?: boolean;
}

const BODY_PATH = 'M50 5C25 5 5 25 5 50C5 65 10 80 18 95L22 85L30 98L38 85L46 98L54 85L62 98L70 85L78 98L82 95C90 80 95 65 95 50C95 25 75 5 50 5Z';

export default function GhostIcon({ className = '', size = 24, outline = false }: GhostIconProps) {
  if (outline) {
    return (
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Ghost body — outline only */}
        <path
          d={BODY_PATH}
          stroke="#00FFCD"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left eye outline */}
        <ellipse cx="35" cy="45" rx="6" ry="7" stroke="#00FFCD" strokeWidth="3" fill="none" />
        {/* Right eye outline */}
        <ellipse cx="65" cy="45" rx="6" ry="7" stroke="#00FFCD" strokeWidth="3" fill="none" />
        {/* Mouth outline */}
        <path
          d="M38 64Q50 78 62 64"
          stroke="#00FFCD"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ghost body */}
      <path
        d={BODY_PATH}
        fill="currentColor"
        opacity="0.9"
      />
      {/* Left eye */}
      <circle cx="35" cy="45" r="8" fill="#070714" />
      <circle cx="33" cy="43" r="3" fill="white" opacity="0.8" />
      {/* Right eye */}
      <circle cx="65" cy="45" r="8" fill="#070714" />
      <circle cx="63" cy="43" r="3" fill="white" opacity="0.8" />
      {/* Laughing mouth */}
      <path
        d="M35 62Q50 80 65 62"
        stroke="#070714"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tongue */}
      <path
        d="M45 68Q50 78 55 68"
        fill="#8F40FF"
        opacity="0.6"
      />
      {/* Cheeks */}
      <circle cx="24" cy="58" r="5" fill="#8F40FF" opacity="0.25" />
      <circle cx="76" cy="58" r="5" fill="#8F40FF" opacity="0.25" />
    </svg>
  );
}