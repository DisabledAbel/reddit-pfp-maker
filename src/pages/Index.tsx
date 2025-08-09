import AvatarConverter from "@/components/AvatarConverter";
import ThemeToggle from "@/components/ThemeToggle";
import HowToReddit from "@/components/HowToReddit";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Basic SEO
    document.title = "Reddit Profile Picture Converter";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "Convert any image into a perfect Reddit profile picture: crop to circle, optional AI background removal, and export as transparent PNG."
      );

    // Canonical tag
    const canonicalHref = window.location.origin + window.location.pathname;
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalHref);

    // FAQ structured data
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I set my Reddit profile picture on desktop?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Go to reddit.com/settings/profile → Profile picture → Upload → Save. Or Profile → Customize profile → Profile picture → Upload → Save. If your Snoo avatar hides the photo, toggle off 'Show avatar' or pick 'Profile picture'.",
          },
        },
        {
          "@type": "Question",
          name: "How do I change my Reddit profile picture on mobile?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Open the Reddit app → Tap your avatar → My profile → Edit profile → Change profile picture → Upload/Take photo → Save.",
          },
        },
      ],
    } as const;

    let script = document.getElementById("faq-structured-data") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "faq-structured-data";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqLd);
  }, []);

  return (
    <main className="container mx-auto max-w-5xl py-10">
      <div className="mb-4 flex items-center justify-end">
        <ThemeToggle />
      </div>
      <AvatarConverter />
      <HowToReddit />
    </main>
  );
};

export default Index;
