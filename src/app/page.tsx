import { Logo } from "@/components/ui/Logo";
import { HomeHeader, Hero } from "@/features/home/Hero";
import { BuildOfTheMonth, Designers, FeaturedBuild, FinalCta, HowItWorks, Marquee, Shops, Stats } from "@/features/home/Sections";
import { PHOTOS } from "@/features/home/photos";

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <HomeHeader />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <HowItWorks />
        <FeaturedBuild />
        <BuildOfTheMonth />
        <Designers />
        <Shops />
        <FinalCta />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-mut sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo size={28} />
            <span>Built for custom culture in South India</span>
            <span>© 2026 KSTM Bay</span>
          </div>
          <p className="text-center text-xs leading-relaxed text-white/35 sm:text-left">
            Builds, shops and prices shown on this page are samples. Photos from Wikimedia Commons:{" "}
            {Object.values(PHOTOS).map((p, i, all) => (
              <span key={p.page}>
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/70">
                  {p.credit}
                </a>{" "}
                ({p.license}){i < all.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
}
