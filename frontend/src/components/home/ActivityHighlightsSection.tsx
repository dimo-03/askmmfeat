import LoopCarousel from '@/components/common/LoopCarousel';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { GALLERY_ITEMS } from '@/data/site';

const HIGHLIGHT_SLIDES = [GALLERY_ITEMS[0], GALLERY_ITEMS[3], GALLERY_ITEMS[6], GALLERY_ITEMS[7]].filter(
  (item): item is (typeof GALLERY_ITEMS)[number] => Boolean(item)
);

export default function ActivityHighlightsSection() {
  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <Reveal animation="fade-in-up">
          <SectionHeading
            eyebrow="Activity Highlights"
            title="Moments From Our Work"
            description="A glimpse of the learning, welfare and community activities the Foundation supports."
          />
        </Reveal>
        <Reveal animation="zoom-in" delay={150} className="mt-12">
          <LoopCarousel
            label="Activity highlights"
            slides={HIGHLIGHT_SLIDES.map((item) => (
              <div key={item.src} className="relative h-[22rem] overflow-hidden rounded-3xl sm:h-[28rem] lg:h-[32rem]">
                <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/90 to-transparent p-6 sm:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">{item.category}</p>
                  <p className="mt-2 font-heading text-xl font-bold text-white sm:text-3xl">{item.caption}</p>
                </div>
              </div>
            ))}
          />
        </Reveal>
      </div>
    </section>
  );
}
