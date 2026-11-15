"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Environment } from "@/data/environments";

/**
 * Tek bir ortam videosu. "autoPlay" yalnızca şimdiki ortamda vardır: sayfa HTML'i gelir gelmez
 * (JavaScript'in yüklenmesini beklemeden) başlar. Sonraki ortam sessizce önceden yüklenir, oynamaz.
 */
function EnvVideo({ environment, active, autoPlay }: { environment: Environment; active: boolean; autoPlay: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => { /* tarayıcı engellerse poster görünür */ });
    } else {
      video.pause();
    }
  }, [active]);
  return <video ref={ref} src={environment.src} poster={environment.poster} autoPlay={autoPlay} muted loop playsInline preload="auto" aria-hidden="true" />;
}

/**
 * Sürekli dönüşen ortamlar: 20 gerçek video. Her geçiş farklı bir dönüşümdür
 * (yumuşak çözülme / dairesel açılma / yatay silme). Yalnızca önceki, şimdiki ve sonraki
 * ortam DOM'dadır. Geçiş, sonraki video ilk karesini gösterecek kadar yüklenmeden BAŞLAMAZ
 * (aksi halde boş/zıplayan kare görünür); en çok 4 sn beklenir.
 */
export function EnvironmentStage({ environments, playing, reduced }: { environments: Environment[]; playing: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const count = environments.length;
  const current = environments[index];

  useEffect(() => {
    if (!playing) return;
    let timer = 0;
    const tryAdvance = (waited: number) => {
      if (document.hidden) { timer = window.setTimeout(() => tryAdvance(waited), 1000); return; }
      const next = document.querySelector<HTMLVideoElement>(".env--next video");
      if (next && next.readyState < 2 && waited < 4000) { timer = window.setTimeout(() => tryAdvance(waited + 400), 400); return; }
      setPrevious(index);
      setIndex((index + 1) % count);
    };
    timer = window.setTimeout(() => tryAdvance(0), current.seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [index, playing, count, current.seconds]);

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
              key={environment.id}
              className={`env env--${role} env--t${transition}${reduced ? " env--calm" : ""}`}
              style={{ "--fx": "50%", "--fy": "50%", "--z0": 1, "--z1": 1.07, "--dur": `${environment.seconds + 2}s` } as React.CSSProperties}
            >
              <EnvVideo environment={environment} active={playing && role !== "next"} autoPlay={role === "current"} />
            </div>
          );
        })}
      </div>
      <div className="env-label">
        <span className="env-label__count">{String(index + 1).padStart(2, "0")} / {count}</span>
        <span className="env-label__name" aria-live="off">{current.name}</span>
        <Link href={current.href} className="env-label__link">Bu ortamdaki ürünler →</Link>
        <span className="env-label__bar" aria-hidden="true"><i key={index} style={{ animationDuration: `${current.seconds}s`, animationPlayState: playing ? "running" : "paused" }} /></span>
      </div>
    </>
  );
}
