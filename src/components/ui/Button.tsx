import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  children: ReactNode;
}

export interface ButtonLinkProps extends LinkProps, ButtonStyleProps {
  children: ReactNode;
}

const baseClasses =
  'inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-700 text-white shadow-sm hover:bg-blue-800 focus-visible:outline-blue-700',
  secondary: 'border border-blue-200 bg-white text-blue-900 hover:bg-blue-50 focus-visible:outline-blue-700',
  ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:outline-blue-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
};

function buttonClasses({ variant = 'primary', size = 'md', className = '' }: ButtonStyleProps): string {
  return [baseClasses, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ');
}

export function Button({ children, variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ children, variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
