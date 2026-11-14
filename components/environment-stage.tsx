"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Environment } from "@/data/environments";

/**
 * Sürekli dönüşen ortamlar: 1. ortam gerçek video, sonrakiler fotoğraf kadrajları.
 * Her geçiş farklı bir dönüşümdür (yumuşak çözülme / dairesel açılma / yatay silme).
 * Yalnızca şimdiki, önceki ve sonraki ortam DOM'dadır (sonraki önceden yüklenir) — hafif kalır.
 */
export function EnvironmentStage({ environments, playing, reduced }: { environments: Environment[]; playing: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const count = environments.length;
  const current = environments[index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (document.hidden) { setTick((value) => value + 1); return; }
      setPrevious(index);
      setIndex((index + 1) % count);
    }, current.seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [index, playing, count, current.seconds, tick]);

  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => setPrevious(null), 1500);
    return () => window.clearTimeout(timer);
  }, [previous]);

  const next = (index + 1) % count;
  const visible = [...new Set([previous, index, next].filter((value): value is number => value !== null))];
  const transition = reduced ? 0 : index % 3;

  return (
    <>
      <div className="env-stage">
        {visible.map((position) => {
          const environment = environments[position];
          const role = position === index ? "current" : position === previous ? "prev" : "next";
          return (
            <div
              key={environment.id + position}
              className={`env env--${role} env--t${transition}${reduced ? " env--calm" : ""}`}
              style={{ "--fx": `${environment.focus[0]}%`, "--fy": `${environment.focus[1]}%`, "--z0": environment.zoom, "--z1": environment.zoom * 1.1, "--dur": `${environment.seconds + 2}s` } as React.CSSProperties}
            >
              {environment.kind === "video" ? (
                <>
                  <Image src={environment.poster ?? "/images/living-room-poster.jpg"} alt="" fill sizes="100vw" priority={position === 0} />
                  {role !== "next" && playing && <video src={environment.src} poster={environment.poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />}
                </>
              ) : (
                <Image src={environment.src} alt="" fill sizes="100vw" priority={position === 0 || role === "current"} style={{ objectPosition: `${environment.focus[0]}% ${environment.focus[1]}%` }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="env-label">
        <span className="env-label__count">{String(index + 1).padStart(2, "0")} / {count}</span>
        <span className="env-label__name" aria-live="off">{current.name}</span>
        <Link href={current.href} className="env-label__link">Bu ortamdaki ürünler →</Link>
        <span className="env-label__bar" aria-hidden="true"><i key={index + String(playing)} style={{ animationDuration: `${current.seconds}s`, animationPlayState: playing ? "running" : "paused" }} /></span>
      </div>
    </>
  );
}
