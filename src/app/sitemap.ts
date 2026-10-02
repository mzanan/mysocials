import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const baseUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
