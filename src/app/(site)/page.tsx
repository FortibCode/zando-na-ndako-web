import { Hero } from '@/components/landing/Hero';
import { Categories } from '@/components/landing/Categories';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { Partners } from '@/components/landing/Partners';
import { Testimonials } from '@/components/landing/Testimonials';
import { AppBanner } from '@/components/landing/AppBanner';

export default function WebLandingPage() {
  return (
    <>
      <Hero />

      {/* Main Content Area matching the reference mockup layout with ample breathing room */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 my-8 sm:my-14 flex-1">
        {/* Row 1: Popular Categories */}
        <Categories />

        {/* Row 2: How It Works & Featured Products Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex">
            <HowItWorks />
          </div>
          <div className="lg:col-span-7 flex">
            <FeaturedProducts />
          </div>
        </div>

        {/* Row 3: Partners & Stalls */}
        <Partners />

        {/* Row 4: Testimonials & App Download Banner Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex">
            <Testimonials />
          </div>
          <div className="lg:col-span-7 flex">
            <AppBanner />
          </div>
        </div>
      </main>
    </>
  );
}
