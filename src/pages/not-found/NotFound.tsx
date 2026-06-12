import { ButtonLink } from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-8xl font-extrabold tracking-tight text-slate-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8">
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </div>
  );
}
