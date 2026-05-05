import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#00C853] text-white hover:bg-[#00b34a] focus:ring-[#00C853] active:scale-[0.98]',
    secondary: 'bg-[#0D1B4B] text-white hover:bg-[#162060] focus:ring-[#0D1B4B] active:scale-[0.98]',
    ghost: 'bg-transparent text-[#0D1B4B] hover:bg-[#F0F4FF] focus:ring-[#0D1B4B] border border-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-6 py-3',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
