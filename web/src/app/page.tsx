import { Hero } from "@/components/sections/Hero";
import { Pain } from "@/components/sections/Pain";
import { Solution } from "@/components/sections/Solution";
import { CTASection } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import { resolveVariant } from "@/lib/variant";

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function HomePage({ searchParams }: PageProps) {
  const variant = resolveVariant(searchParams);

  return (
    <>
      <main className="min-h-screen">
        <Hero variant={variant} />
        <Pain variant={variant} />
        <Solution />
        <CTASection variant={variant} />
      </main>
      <Footer />
    </>
  );
}
