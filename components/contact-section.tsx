import { Suspense } from 'react'
import { Mail, MapPin, Clock } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'
import { site } from '@/lib/site'

const details = [
  { icon: Mail, label: 'Email', value: site.email, href: site.emailHref },
  { icon: MapPin, label: 'Service area', value: site.serviceArea },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri, 7:00am – 5:00pm AEST' },
]

export function ContactSection() {
  return (
    <section id="contact" className="bg-enquiry-gradient py-20 text-primary-foreground md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
              Make an Enquiry
            </span>
            <h2 className="mt-3 text-balance font-heading text-3xl font-black tracking-tight text-primary-foreground md:text-4xl">
              Building safety from the ground up.
            </h2>
            <p className="mt-4 leading-relaxed text-primary-foreground/80">
              Tell us about your worksite, the risks you are managing and where you would like WHS to be
              working harder. We&apos;ll get back to you promptly.
            </p>

            <ul className="mt-8 space-y-5">
              {details.map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-gold">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary-foreground">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-primary-foreground/70">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Suspense fallback={<div className="rounded-xl border border-border bg-card p-8" />}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
