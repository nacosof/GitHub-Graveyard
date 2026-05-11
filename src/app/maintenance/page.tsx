export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="absolute inset-0 -z-10 opacity-[0.22]">
        <div className="gg-scanlines absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(255,255,255,0.10),transparent_65%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-20">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="gg-retro text-xs font-semibold tracking-wider text-white/60">
            GITHUB GRAVEYARD
          </div>
          <h1 className="gg-pixel-title mt-3 text-balance text-4xl leading-[1.05]">
            Maintenance in progress
          </h1>
          <p className="mt-3 text-pretty text-sm text-white/70">
            We’re performing scheduled maintenance. Please check back soon.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-black/25 p-6 text-sm text-white/70">
          <div className="font-semibold text-white/80">What you can do</div>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Refresh the page in a few minutes.</li>
            <li>If you’re in the middle of a payment, keep the payment provider tab open until it finishes.</li>
            <li>For urgent issues, contact: <span className="text-white/85">nacosof@gmail.com</span></li>
          </ul>
        </section>
      </div>
    </main>
  );
}

