import type { MockLink } from "./MockProfileCard";

export interface HeroCreator {
  name: string;
  handle: string;
  avatar: string;
  links: MockLink[];
}

export const HERO_COLUMNS: HeroCreator[][] = [
  [
    { name: "Mara Ávalos", handle: "@maraavalos", avatar: "/people/p07.webp", links: [{ slug: "instagram", label: "@maraavalos" }, { slug: "youtube", label: "YouTube" }] },
    { name: "Leo Fields", handle: "@leofilms", avatar: "/people/p21.webp", links: [{ slug: "tiktok", label: "TikTok" }, { slug: "spotify", label: "Latest drop" }] },
    { name: "Nina Cole", handle: "@ninacole", avatar: "/people/p33.webp", links: [{ slug: "instagram", label: "@ninacole" }, { slug: "twitch", label: "Live now" }] },
    { name: "Hugo Lima", handle: "@hugolima", avatar: "/people/p09.webp", links: [{ slug: "youtube", label: "Tutorials" }, { slug: "github", label: "Code" }] },
    { name: "Vera Nilsson", handle: "@veranilsson", avatar: "/people/p52.webp", links: [{ slug: "spotify", label: "Mixtape" }, { slug: "instagram", label: "Studio" }] },
  ],
  [
    { name: "Theo Park", handle: "@theopark", avatar: "/people/p12.webp", links: [{ slug: "youtube", label: "Channel" }, { slug: "github", label: "Projects" }] },
    { name: "Aria Sol", handle: "@ariasol", avatar: "/people/p41.webp", links: [{ slug: "spotify", label: "New single" }, { slug: "instagram", label: "@ariasol" }] },
    { name: "Dev Mehta", handle: "@devmehta", avatar: "/people/p18.webp", links: [{ slug: "linkedin", label: "LinkedIn" }, { slug: "twitter", label: "Follow" }] },
    { name: "Iris Wong", handle: "@iriswong", avatar: "/people/p24.webp", links: [{ slug: "tiktok", label: "Daily" }, { slug: "youtube", label: "Shorts" }] },
    { name: "Marco Bianchi", handle: "@marcobianchi", avatar: "/people/p38.webp", links: [{ slug: "instagram", label: "Gallery" }, { slug: "spotify", label: "Sets" }] },
  ],
  [
    { name: "Sofia Ren", handle: "@sofiaren", avatar: "/people/p27.webp", links: [{ slug: "tiktok", label: "TikTok" }, { slug: "instagram", label: "Photos" }] },
    { name: "Kai Storm", handle: "@kaistorm", avatar: "/people/p45.webp", links: [{ slug: "twitch", label: "Stream" }, { slug: "youtube", label: "Clips" }] },
    { name: "Lucia Mar", handle: "@luciamar", avatar: "/people/p03.webp", links: [{ slug: "instagram", label: "@luciamar" }, { slug: "spotify", label: "Playlist" }] },
    { name: "Noah Reed", handle: "@noahreed", avatar: "/people/p30.webp", links: [{ slug: "youtube", label: "Films" }, { slug: "twitter", label: "Notes" }] },
    { name: "Elena Cruz", handle: "@elenacruz", avatar: "/people/p48.webp", links: [{ slug: "tiktok", label: "Recipes" }, { slug: "instagram", label: "Food" }] },
  ],
  [
    { name: "Omar Vidal", handle: "@omarvidal", avatar: "/people/p50.webp", links: [{ slug: "youtube", label: "Films" }, { slug: "instagram", label: "Behind" }] },
    { name: "Yui Tanaka", handle: "@yuitanaka", avatar: "/people/p36.webp", links: [{ slug: "tiktok", label: "Dance" }, { slug: "spotify", label: "Sounds" }] },
    { name: "Bea Costa", handle: "@beacosta", avatar: "/people/p14.webp", links: [{ slug: "instagram", label: "Travel" }, { slug: "youtube", label: "Vlogs" }] },
    { name: "Sam Okafor", handle: "@samokafor", avatar: "/people/p05.webp", links: [{ slug: "twitch", label: "Gaming" }, { slug: "youtube", label: "Highlights" }] },
    { name: "Clara Roy", handle: "@clararoy", avatar: "/people/p43.webp", links: [{ slug: "linkedin", label: "Work" }, { slug: "instagram", label: "Sketch" }] },
  ],
];

export const HERO_DRIFT_BASE_SECONDS = 44;
export const HERO_DRIFT_STEP_SECONDS = 7;
