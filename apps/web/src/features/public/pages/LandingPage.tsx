import { HeroSection } from '../components/HeroSection';
import { StatisticsSection } from '../components/StatisticsSection';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { PlatformModules } from '../components/PlatformModules';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { CTASection } from '../components/CTASection';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <StatisticsSection />
      <FeaturesGrid />
      <WorkflowTimeline />
      <PlatformModules />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
