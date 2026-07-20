import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Policies & Legal | Solum Safety Consulting",
  description:
    "Copyright, privacy, refunds, template licence and disclaimers for Solum Safety Consulting. Read before purchasing templates or engaging our services.",
  alternates: { canonical: "/policies" },
  openGraph: {
    title: "Policies & Legal | Solum Safety Consulting",
    description:
      "Copyright, privacy, refunds, template licence and disclaimers for Solum Safety Consulting.",
    url: "/policies",
    type: "website",
  },
}

const sections = [
  { id: "copyright", num: "01", nav: "Copyright & IP", title: "Copyright & Intellectual Property" },
  { id: "privacy", num: "02", nav: "Privacy Policy", title: "Privacy Policy" },
  { id: "refunds", num: "03", nav: "Refund Policy", title: "Refund Policy" },
  { id: "licence", num: "04", nav: "Template Licence", title: "Template & Form Licence and Disclaimer" },
  { id: "disclaimers", num: "05", nav: "Disclaimers", title: "General Disclaimer & Limitation of Liability" },
  { id: "terms", num: "06", nav: "Website Terms", title: "Website Terms of Use" },
]

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-terracotta" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-primary-gradient-glow text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-accent" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Policies &amp; Legal</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-pretty font-heading text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Our policies, terms &amp; legal information
            </h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-primary-foreground/85">
              Please read these policies before purchasing templates or engaging our services. They set out
              your rights, our terms, and the limits of our liability. Nothing here removes rights you have
              under the Australian Consumer Law.
            </p>
          </div>
        </section>

        <section className="bg-background py-14 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
            {/* Sidebar nav */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav aria-label="Policy sections" className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="font-mono text-xs text-terracotta">{s.num}</span> {s.nav}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="max-w-3xl">
              <div className="space-y-14">
                {/* 01 Copyright */}
                <article id="copyright" className="scroll-mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {sections[0].num} · Copyright &amp; Intellectual Property
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{sections[0].title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    All content on this website and in all templates, forms, reports, documents, designs, text,
                    graphics and materials produced by Solum Safety Consulting (collectively, the &quot;Materials&quot;)
                    is owned by or licensed to Solum Safety Consulting and is protected by Australian and
                    international copyright and intellectual property laws.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">You must not</h3>
                  <Bullets
                    items={[
                      "Reproduce, resell, sub-license, distribute, share, publish or commercially exploit any Material, in whole or in part, except as expressly permitted by a licence you have purchased;",
                      "Remove, obscure or alter any copyright notice, watermark, branding or attribution;",
                      "Use the Materials to create competing products, template libraries or derivative works for distribution;",
                      "Provide, on-sell or make the Materials available to any third party, related entity or other business.",
                    ]}
                  />
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    A purchase grants a limited, non-exclusive, non-transferable licence for use within the
                    purchaser&apos;s own organisation only (see Template &amp; Form Licence). All rights not expressly
                    granted are reserved. Unauthorised use may result in suspension of licence and legal action to
                    recover loss and damages.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    &quot;Solum&quot;, &quot;Solum Safety Consulting&quot;, the Solum logo and &quot;Building Safety from the Ground Up&quot;
                    are trade marks of Solum Safety Consulting and must not be used without written permission.
                  </p>
                </article>

                {/* 02 Privacy */}
                <article id="privacy" className="scroll-mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {sections[1].num} · Privacy Policy
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{sections[1].title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Solum Safety Consulting is committed to protecting your privacy and complies with the Privacy
                    Act 1988 (Cth) and the Australian Privacy Principles (APPs).
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">Information we collect</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We collect personal information you provide directly, such as your name, email, phone,
                    company, ABN and the details of your enquiry or order. We may also collect limited technical
                    data (such as browser and usage analytics) when you use this website.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">How we use it</h3>
                  <Bullets
                    items={[
                      "To respond to enquiries and provide our services and products;",
                      "To process orders, licences and payments;",
                      "To send you information you have requested or that relates to your engagement;",
                      "To meet our legal, accounting and record-keeping obligations.",
                    ]}
                  />
                  <h3 className="mt-6 text-sm font-bold text-foreground">Disclosure</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We do not sell your personal information. We may share it with trusted service providers (for
                    example payment processors or IT providers) strictly to deliver our services, and where
                    required by law. We take reasonable steps to hold your information securely.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">Your rights</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    You may request access to, or correction of, the personal information we hold about you, and
                    you may ask us to stop sending you marketing communications at any time. To make a request or a
                    privacy complaint, contact us using the details below. If you are not satisfied with our
                    response you may contact the Office of the Australian Information Commissioner (OAIC).
                  </p>
                </article>

                {/* 03 Refunds */}
                <article id="refunds" className="scroll-mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {sections[2].num} · Refund Policy
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{sections[2].title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    This policy applies to all template, form and digital product purchases, and to consulting
                    services. It must be read together with your rights under the Australian Consumer Law (ACL).
                  </p>
                  <p className="mt-4 rounded-lg border border-olive/30 bg-olive/10 px-4 py-3 text-sm leading-relaxed text-foreground">
                    Your Australian Consumer Law rights are not excluded. Our goods and services come with
                    guarantees that cannot be excluded under the ACL. Nothing in this policy limits those rights.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">Digital templates &amp; forms</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Our templates and forms are digital products supplied immediately on purchase. Because they are
                    downloadable and can be copied, we do not offer refunds for change of mind, including where you
                    have purchased the wrong item, no longer need it, or found it cheaper elsewhere. Please review
                    the description, preview and specifications carefully before purchasing. Contact us first if you
                    are unsure whether a template suits your needs. You are entitled to a remedy where a product is
                    faulty, materially not as described, or does not do what we said it would, as required by the
                    ACL.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">Consulting &amp; assessment services</h3>
                  <Bullets
                    items={[
                      "Fees for work already performed (assessments, reports, advice, time) are non-refundable.",
                      "Bookings cancelled by you with reasonable notice may be rescheduled; deposits may be non-refundable to cover work already commenced and reserved time.",
                      "If we fail to deliver a service with due care and skill, you are entitled to a remedy under the ACL.",
                    ]}
                  />
                  <h3 className="mt-6 text-sm font-bold text-foreground">How to request a remedy</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Contact us within a reasonable time with your order details and a description of the issue.
                    Approved remedies are processed to your original payment method. We may ask for evidence of the
                    fault before providing a remedy.
                  </p>
                </article>

                {/* 04 Licence */}
                <article id="licence" className="scroll-mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {sections[3].num} · Template &amp; Form Licence
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{sections[3].title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    When you purchase a Solum template or form, you are granted a limited, non-exclusive,
                    non-transferable licence to use it within your own organisation only.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">You may</h3>
                  <Bullets
                    items={[
                      "Insert your own logo, business details and content, and use the document in your own business operations;",
                      "Print, complete and store the document as part of your own management systems.",
                    ]}
                  />
                  <h3 className="mt-6 text-sm font-bold text-foreground">You may not</h3>
                  <Bullets
                    items={[
                      "Resell, redistribute, share, sub-license or supply the template to any other person, business or related entity;",
                      "Publish it online, add it to another template library, or use it to provide template products to others.",
                    ]}
                  />
                  <h3 className="mt-6 text-sm font-bold text-foreground">Important disclaimer</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Templates and forms are general tools only. They do not constitute legal, safety, environmental
                    or professional advice and do not guarantee compliance with the WHS Act 2011, WHS Regulation
                    2025 (NSW), any environmental approval, licence, Code of Practice or any other law. You are
                    responsible for ensuring each document is accurate, complete, current and suitable for your
                    workplace before you rely on it.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Environmental templates: you must follow the conditions of consent issued by the relevant
                    authority and your project&apos;s Construction Environmental Management Plan (CEMP). If you have any
                    questions, speak to a qualified environmental consultant or the consent authority before relying
                    on the document. To the maximum extent permitted by law, Solum Safety Consulting accepts no
                    liability for any loss, damage, penalty, claim or cost arising from the use of, or reliance on,
                    any template or form.
                  </p>
                </article>

                {/* 05 Disclaimers */}
                <article id="disclaimers" className="scroll-mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {sections[4].num} · General Disclaimer &amp; Liability
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{sections[4].title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    The information, services, reports and products provided by Solum Safety Consulting are intended
                    to assist organisations with work health &amp; safety and environmental management. They are
                    provided in good faith and based on information available at the time.
                  </p>
                  <Bullets
                    items={[
                      "Our services and materials do not constitute legal advice and are not a guarantee of compliance with any legislation, regulation, approval or standard;",
                      "An assessment or report reflects conditions and documentation reviewed at the time and does not guarantee that all hazards, risks or non-compliances have been identified;",
                      "Responsibility for compliance with all applicable laws, and for the health and safety of workers and others, remains with the client organisation and its duty holders at all times;",
                      "You should seek independent legal, safety or environmental advice where appropriate.",
                    ]}
                  />
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    To the maximum extent permitted by law, and subject to any rights that cannot be excluded under
                    the Australian Consumer Law, Solum Safety Consulting&apos;s total liability for any claim arising
                    from our services or products is limited, at our option, to re-supplying the service or product
                    or paying the cost of having it re-supplied. We are not liable for any indirect, consequential,
                    special or economic loss.
                  </p>
                </article>

                {/* 06 Terms */}
                <article id="terms" className="scroll-mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                    {sections[5].num} · Website Terms of Use
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{sections[5].title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    By accessing this website you agree to use it lawfully and not to misuse, copy, scrape or
                    interfere with it or its content. Content is provided for general information and may be updated
                    or changed at any time without notice.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    These policies are governed by the laws of New South Wales, Australia, and you submit to the
                    non-exclusive jurisdiction of its courts. If any provision is found to be unenforceable, the
                    remaining provisions continue in force. We may update these policies from time to time; the
                    current version is the one published on this page.
                  </p>
                  <h3 className="mt-6 text-sm font-bold text-foreground">Contact</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    For any questions about these policies, to make a privacy request, or to request a remedy,
                    please{" "}
                    <Link href="/#contact" className="font-semibold text-terracotta hover:underline">
                      make an enquiry
                    </Link>{" "}
                    and we will respond promptly.
                  </p>
                </article>

                <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
                  Last updated: June 2026. &copy; {new Date().getFullYear()} Solum Safety Consulting. These
                  policies are provided as general information for our customers and do not themselves constitute
                  legal advice.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
