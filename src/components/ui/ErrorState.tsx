import type { ReactNode } from 'react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
}

export function ErrorState({ title = 'Something went wrong', message, action }: ErrorStateProps) {
  return (
    <section role="alert" className="rounded-3xl border border-orange-200 bg-orange-50 p-8 text-orange-950">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-orange-900">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
