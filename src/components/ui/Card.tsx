import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'article' | 'section' | 'div';
  hoverable?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const cardClasses = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow';
const hoverClasses = 'hover:shadow-md hover:border-slate-300 cursor-pointer';

export function Card({ children, as: Element = 'section', hoverable = false, className = '', ...props }: CardProps) {
  return (
    <Element className={[cardClasses, hoverable ? hoverClasses : '', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Element>
  );
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={['mb-4 flex flex-col gap-1', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}
