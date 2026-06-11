export type ApiSource = 'rest' | 'graphql';

interface ApiSourceToggleProps {
  source: ApiSource;
  onChange: (source: ApiSource) => void;
}

const LABELS: Record<ApiSource, string> = { rest: 'REST', graphql: 'GraphQL' };

export default function ApiSourceToggle({ source, onChange }: ApiSourceToggleProps) {
  return (
    <span className="flex items-center gap-1 text-xs">
      <span className="mr-1 text-gray-500">Loaded via</span>
      {(Object.keys(LABELS) as ApiSource[]).map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={
            option === source
              ? 'rounded bg-blue-600 px-2 py-1 font-medium text-white'
              : 'rounded border border-gray-300 px-2 py-1 text-gray-600 hover:bg-gray-100'
          }
        >
          {LABELS[option]}
        </button>
      ))}
    </span>
  );
}
