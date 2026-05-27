const SITE_URL = "https://links.itsmatias.com";

export function StructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Matias Zanan",
      url: SITE_URL,
      sameAs: [
        "https://itsmatias.com",
        "https://instagram.com/matiasenasia",
        "https://www.tiktok.com/@matiasenasia",
        "https://www.youtube.com/@PerdidoenAsia",
        "https://twitch.tv/mzanan",
        "https://twitch.tv/mzanann",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Matias Social Media",
      url: SITE_URL,
      description: "All my social networks in one place",
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
