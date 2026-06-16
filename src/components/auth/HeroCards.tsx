import { MockProfileCard } from "./MockProfileCard";
import {
  HERO_COLUMNS,
  HERO_DRIFT_BASE_SECONDS,
  HERO_DRIFT_STEP_SECONDS,
  type HeroCreator,
} from "./heroCreators";

const HERO_EDGE_MASK =
  "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)";

function HeroSet({ creators }: { creators: HeroCreator[] }) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {creators.map((c) => (
        <MockProfileCard
          key={c.handle}
          name={c.name}
          handle={c.handle}
          avatar={c.avatar}
          links={c.links}
          className="w-full"
        />
      ))}
    </div>
  );
}

const SETS_PER_COLUMN = 4;

function HeroColumn({
  creators,
  direction,
  duration,
}: {
  creators: HeroCreator[];
  direction: "up" | "down";
  duration: number;
}) {
  return (
    <div
      className="flex w-40 shrink-0 flex-col sm:w-48 lg:w-56"
      style={{
        animation: `hero-bounce ${duration}s ease-in-out infinite ${direction === "down" ? "alternate-reverse" : "alternate"}`,
      }}
    >
      {Array.from({ length: SETS_PER_COLUMN }, (_, k) => (
        <HeroSet key={k} creators={creators} />
      ))}
    </div>
  );
}

export function HeroCards() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 flex justify-center gap-4 px-3 lg:gap-5"
        style={{
          maskImage: HERO_EDGE_MASK,
          WebkitMaskImage: HERO_EDGE_MASK,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        {HERO_COLUMNS.map((creators, i) => (
          <HeroColumn
            key={i}
            creators={creators}
            direction={i % 2 ? "down" : "up"}
            duration={HERO_DRIFT_BASE_SECONDS + i * HERO_DRIFT_STEP_SECONDS}
          />
        ))}
      </div>
    </div>
  );
}
