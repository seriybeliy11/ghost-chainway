'use client';

interface GhostIconProps {
  className?: string;
  size?: number;
  outline?: boolean;
}

/**
 * Ghost icon rendered from a PNG asset.
 *
 * Two variants are pre-rendered from the source image (white ghost on
 * black background → luminance mapped to alpha):
 *  - default: `/ghost-white.png` — white ghost, transparent background
 *  - outline: `/ghost-teal.png`  — mint-green (#00FFCD) ghost, transparent bg
 *
 * `className` still applies (layout, opacity, etc.).
 * `size` controls the rendered dimensions in px.
 */
export default function GhostIcon({ className = '', size = 24, outline = false }: GhostIconProps) {
  const src = outline ? '/ghost-teal.png' : '/ghost-white.png';
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  );
}
