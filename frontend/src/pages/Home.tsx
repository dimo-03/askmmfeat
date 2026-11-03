import HeroSection from '@/components/home/HeroSection';
import AboutPreviewSection from '@/components/home/AboutPreviewSection';
import MissionVisionSection from '@/components/home/MissionVisionSection';
import KeyInitiativesSection from '@/components/home/KeyInitiativesSection';
import ActivityHighlightsSection from '@/components/home/ActivityHighlightsSection';
import ImpactStatsSection from '@/components/home/ImpactStatsSection';
import LeadershipPreviewSection from '@/components/home/LeadershipPreviewSection';
import LatestEventsSection from '@/components/home/LatestEventsSection';
import GalleryPreviewSection from '@/components/home/GalleryPreviewSection';
import GetInvolvedSection from '@/components/home/GetInvolvedSection';
import DonateCtaSection from '@/components/home/DonateCtaSection';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle('Home - Advocate Susil Kumar Mohapatra Memorial Foundation and Educational Trust');

  return (
    <>
      <HeroSection />
      <AboutPreviewSection />
      {/* <MissionVisionSection /> */}
      <KeyInitiativesSection />
      <ActivityHighlightsSection />
      <ImpactStatsSection />
      {/* <LeadershipPreviewSection /> */}
      <LatestEventsSection />
      {/* <GalleryPreviewSection /> */}
      <GetInvolvedSection />
      <DonateCtaSection />
    </>
  );
}
