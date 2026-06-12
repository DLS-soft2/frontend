export type ApiSource = 'rest' | 'graphql';

interface ApiSourceToggleProps {
  source: ApiSource;
  onChange: (source: ApiSource) => void;
}

const LABELS: Record<ApiSource, string> = { rest: 'REST', graphql: 'GraphQL' };

export default function ApiSourceToggle({ source, onChange }: ApiSourceToggleProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs">
      <span className="pl-1.5 text-slate-500">Loaded via</span>
      {(Object.keys(LABELS) as ApiSource[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            option === source
              ? 'rounded-full bg-blue-700 px-2.5 py-0.5 font-semibold text-white shadow-sm transition'
              : 'rounded-full px-2.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-200'
          }
        >
          {LABELS[option]}
        </button>
      ))}
    </span>
  );
}
