export interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({ title = 'Loading', message = 'Fetching the latest delivery data.' }: LoadingStateProps) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center text-blue-950"
    >
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-blue-800">{message}</p>
    </section>
  );
}
