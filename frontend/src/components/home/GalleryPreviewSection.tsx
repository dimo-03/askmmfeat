import { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Lightbox from '@/components/common/Lightbox';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { GALLERY_ITEMS, type GalleryCategory, type GalleryItem } from '@/data/site';
import api from '@/lib/api';

const DEFAULT_PREVIEWS = GALLERY_ITEMS.slice(0, 6);

export default function GalleryPreviewSection() {
  const [previewItems, setPreviewItems] = useState<GalleryItem[]>(DEFAULT_PREVIEWS);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    let isMounted = true;
    api.gallery
      .getAll({ limit: 6 })
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        const mapped: GalleryItem[] = data.slice(0, 6).map((item) => ({
          src: item.photo,
          alt: item.caption || 'Foundation photograph',
          caption: item.caption || 'Community programme',
          category: (item.album as GalleryCategory) || 'Community Programmes',
        }));
        setPreviewItems(mapped);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <Reveal animation="fade-in-down">
          <SectionHeading eyebrow="Gallery" title="Glimpses From the Field" description="Selected photographs from educational programmes, workshops, social activities and community events." />
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {previewItems.map((item, index) => (
            <Reveal key={item.src} animation="zoom-in" delay={index * 90} className={index === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open photo: ${item.caption}`}
                className="group relative block h-full w-full overflow-hidden rounded-2xl bg-navy-100 shadow-card"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full min-h-[11rem] w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:min-h-[14rem]"
                />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="p-4 text-left text-sm font-semibold text-white">{item.caption}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal animation="fade-in-up" delay={200} className="mt-12 flex justify-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy-900 px-6 py-3 font-semibold text-navy-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-900 hover:text-white"
          >
            View Full Gallery
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <Lightbox images={previewItems} index={activeIndex} onClose={closeLightbox} onIndexChange={setActiveIndex} />
    </section>
  );
}
