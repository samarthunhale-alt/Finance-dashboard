import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-extrabold text-pine">404</p>
      <h1 className="text-xl font-bold">This page does not exist</h1>
      <p className="text-sm text-ink-soft">The link may be broken or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-2">Back to home</Link>
    </div>
  );
}
