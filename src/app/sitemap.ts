import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listIndexableProfiles } from "@/lib/profile/listIndexableProfiles";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await listIndexableProfiles();
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...profiles.map((profile) => ({
      url: `${SITE_URL}/${profile.username}`,
      lastModified: new Date(profile.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...["/privacy", "/terms"].map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
