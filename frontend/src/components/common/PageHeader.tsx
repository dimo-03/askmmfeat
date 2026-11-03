import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/common/Reveal';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  image: string;
  crumbs: Crumb[];
}

export default function PageHeader({ title, description, image, crumbs }: PageHeaderProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-900 via-navy-900/90 to-navy-700/80" />
      <div className="container-x py-16 sm:py-20 lg:py-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-navy-100">
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gold-300" aria-hidden="true" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="rounded transition-colors hover:text-gold-300">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gold-300" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <Reveal animation="fade-in-up">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <span className="gold-rule mt-5" aria-hidden="true" />
          {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-100">{description}</p>}
        </Reveal>
      </div>
    </section>
  );
}
