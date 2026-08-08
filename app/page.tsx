import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { SectorsSection } from "@/components/sectors-section"
import { FieldAppSection } from "@/components/field-app-section"
import { ContactSection } from "@/components/contact-section"
import { SiteFooter } from "@/components/site-footer"
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SectorsSection />
        <FieldAppSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}
