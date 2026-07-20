import Image from "next/image"

export function WorksiteBand() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[460px] w-full sm:h-[520px]">
        <Image
          src="/worksite-outback.png"
          alt="A remote Australian worksite where safety systems are put to work"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-accent" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                Out Where The Work Happens
              </span>
            </div>
            <h2 className="mt-4 max-w-3xl text-balance font-heading text-3xl font-black leading-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Real worksites, real conditions, safety that works where you work.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
              From remote bushland to busy civil sites, we build WHS systems for the ground your teams
              stand on every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
