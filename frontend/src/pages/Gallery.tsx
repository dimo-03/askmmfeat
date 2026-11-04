import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import Lightbox from '@/components/common/Lightbox';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import { GALLERY_CATEGORIES, GALLERY_ITEMS, type GalleryCategory, type GalleryItem } from '@/data/site';
import api from '@/lib/api';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const FILTERS = ['All', ...GALLERY_CATEGORIES] as const;

export default function Gallery() {
  useDocumentTitle('Gallery - Photographs from Educational and Community Programmes');
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const refreshGallery = useCallback(() => {
    api.gallery
      .getAll()
      .then((data) => {
        if (!data || data.length === 0) {
          setGalleryList(GALLERY_ITEMS);
          return;
        }
        const mapped: GalleryItem[] = data.map((item) => ({
          src: item.photo,
          alt: item.caption || 'Foundation photograph',
          caption: item.caption || 'Community programme',
          category: (item.album as GalleryCategory) || 'Community Programmes',
        }));
        setGalleryList(mapped);
      })
      .catch(() => {
        setGalleryList(GALLERY_ITEMS);
      });
  }, []);

  useEffect(() => {
    refreshGallery();
    const onWindowFocus = () => refreshGallery();
    window.addEventListener('focus', onWindowFocus);
    return () => {
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [refreshGallery]);

  const items = useMemo(
    () => (filter === 'All' ? galleryList : galleryList.filter((item) => item.category === filter)),
    [galleryList, filter]
  );

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photographs from educational programmes, workshops, social activities and community events."
        image="https://images.pexels.com/photos/6684500/pexels-photo-6684500.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Gallery' }]}
      />

      <section className="section-y bg-white">
        <div className="container-x">
          <div
            role="group"
            aria-label="Filter gallery by category"
            className="-mx-5 flex max-w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => {
                  setFilter(option);
                  setActiveIndex(null);
                }}
                className={`flex-shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-sm ${
                  filter === option
                    ? 'border-navy-900 bg-navy-900 text-white shadow-card'
                    : 'border-navy-200 bg-white text-navy-900 hover:border-gold-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
            {items.map((item, index) => (
              <Reveal key={item.src} animation="zoom-in" delay={(index % 6) * 60} className="mb-6 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Open photo: ${item.caption}`}
                  className="group relative block w-full overflow-hidden rounded-2xl shadow-card"
                >
                  <img src={item.src} alt={item.alt} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-navy-900 to-navy-900/0 p-5 text-left transition-transform duration-500 group-hover:translate-y-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gold-300">{item.category}</span>
                    <span className="mt-1 block text-sm font-semibold text-white">{item.caption}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
          {items.length === 0 && <p className="mt-12 text-center text-muted">No photographs in this category yet.</p>}
        </div>
      </section>

      <section className="section-y bg-mist">
        {/* <div className="container-x">
          <Reveal animation="fade-in-up">
            <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-navy-200 bg-white p-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-gold-400">
                <PlayCircle className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-bold">Videos</h2>
              <p className="max-w-xl text-muted">
                Videos from the Foundation's YouTube channel will appear here once the official channel link has been
                added.
              </p>
            </div>
          </Reveal>
        </div> */}
      </section>

      <Lightbox images={items} index={activeIndex} onClose={closeLightbox} onIndexChange={setActiveIndex} />
    </>
  );
}
