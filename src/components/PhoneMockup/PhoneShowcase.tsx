"use client";

import { LazyMotion, domAnimation } from "motion/react";
import { PhoneMockup } from "./PhoneMockup";

export function PhoneShowcase() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
      <LazyMotion features={domAnimation}>
        <PhoneMockup />
      </LazyMotion>
    </div>
  );
}
