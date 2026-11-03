import { Home, SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found - Advocate Susil Kumar Mohapatra Memorial Foundation');

  return (
    <section className="section-y bg-mist">
      <div className="container-x flex flex-col items-center gap-6 py-10 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900 text-gold-400">
          <SearchX className="h-10 w-10" aria-hidden="true" />
        </span>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">Error 404</p>
        <h1 className="text-3xl font-bold sm:text-4xl">We could not find that page</h1>
        <p className="max-w-md text-muted">The address may be incorrect or the page may have moved.</p>
        <ButtonLink to="/" variant="navy">
          <Home className="h-5 w-5" aria-hidden="true" />
          Back to Home
        </ButtonLink>
      </div>
    </section>
  );
}
