"use client";

import { useEffect, useState } from "react";

export function HeroVideo() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(min-width: 769px) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return enabled ? <video className="hero-motion" src="/video/living-room.mp4"
    poster="/images/sofa-gallery.png" autoPlay muted loop playsInline preload="none" aria-hidden="true" /> : null;
}
