import { DiscoverFeed } from "@/features/graveyard/components/DiscoverFeed";
import { RepoScanner } from "@/features/graveyard/components/RepoScanner";
import { FloatingDecor } from "@/features/home/FloatingDecor";
import { HomeHero } from "@/features/home/HomeHero";
import { HowItWorks } from "@/features/home/HowItWorks";
import { CategoryWorlds } from "@/features/worlds/CategoryWorlds";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="relative isolate overflow-hidden">
        <FloatingDecor />
        <div className="gg-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_20%,black,transparent)]">
          <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/10 to-transparent blur-3xl" />
          <div className="absolute -right-40 -top-24 size-[520px] rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
          <HomeHero />

          <RepoScanner />

          <CategoryWorlds />

          <DiscoverFeed />

          <HowItWorks />
        </div>
      </div>
    </main>
  );
}
