import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'article' | 'section' | 'div';
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const cardClasses = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm';

export function Card({ children, as: Element = 'section', className = '', ...props }: CardProps) {
  return (
    <Element className={[cardClasses, className].filter(Boolean).join(' ')} {...props}>
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
