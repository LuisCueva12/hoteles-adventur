'use client';

interface Props {
  className?: string;
  variant?: 'default' | 'footer';
}

export function Logo({ className = 'h-10' }: Props) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.webp"
        alt="Adventur Hotels Logo"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
