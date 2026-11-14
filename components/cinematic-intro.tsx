"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EnvironmentStage } from "@/components/environment-stage";
import { environments } from "@/data/environments";

/**
 * Sinematik giriş: tam ekran GERÇEK video (Pexels, sessiz/inline). Sayfa kaydırılırken video
 * içeri doğru yakınlaşır, başlık silinir ve sonraki sahne yuvarlak bir "pencereden" açılır.
 * Bu geçiş kaydırmaya bağlı CSS dönüşümüdür; videonun kendisi ayrıdır.
 *
 * Video giriş açılır açılmaz kendiliğinden oynar ve durdurma düğmesi yoktur (kullanıcı kararı).
 * Cihaz "hareketi azalt" diyorsa yalnızca kaydırma geçişi ve yakınlaşma kapanır; video yine oynar.
 * Giriş ekrandan çıkınca video ve ortam döngüsü durur, geri gelince devam eder.
 * Telefon/dokunmatik cihazlarda kaydırma efekti kapalıdır (CSS ile düz bölüm); masaüstünde çalışır.
 */
export function CinematicIntro({ nextImage, nextAlt, nextTitle }: { nextImage: string; nextAlt: string; nextTitle: string }) {
  const root = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  // Giriş kaydırılarak çıkıldıkça video/ortam döngüsü durdurulur (telefonda kasmayı önler).
  const [active, setActive] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const motion = !reduced;

  useEffect(() => {
    const section = root.current;
    const stage = sticky.current;
    if (!section || !stage) return;
    // Telefon/dokunmatik/dar ekran: kaydırma efekti YOK. Giriş tek parça bir bölümdür ve sayfa doğal (GPU) kaydırmasıyla
    // akar; yalnızca ekrandan çıkınca video durur. Böylece çıkışta JavaScript çalışmaz ve kasma olmaz.
    const lite = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    if (lite || !motion) {
      const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.12 });
      observer.observe(section);
      return () => observer.disconnect();
    }

    // Masaüstü: kaydırmaya bağlı sinematik geçiş. Ölçümler önbelleğe alınır; kaydırmada yerleşim okunmaz.
    let frame = 0;
    let top = 0;
    let range = 1;
    const measure = () => {
      top = section.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, section.offsetHeight - window.innerHeight);
    };
    const apply = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, (window.scrollY - top) / range));
      const reveal = Math.min(1, Math.max(0, (progress - 0.3) / 0.6));
      stage.style.setProperty("--zoom", progress.toFixed(3));
      stage.style.setProperty("--reveal", reveal.toFixed(3));
      stage.style.setProperty("--title", Math.max(0, 1 - progress / 0.25).toFixed(3));
      const nowActive = progress < 0.6;
      setActive((value) => (value === nowActive ? value : nowActive));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(apply); };
    const onResize = () => { measure(); onScroll(); };
    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [motion]);

  return (
    <section ref={root} className={`cin${motion ? "" : " cin--static"}`} aria-label="NUVESSA">
      <div ref={sticky} className="cin__sticky">
        <div className="cin__stage">
          <EnvironmentStage environments={environments} playing={active} reduced={reduced} />
        </div>
        <div className="cin__shade" aria-hidden="true" />
        <div className="cin__title">
          <h1>NUVESSA</h1>
          <p>Bir evden daha fazlası</p>
          <div className="cin__cta">
            <Link className="zbtn zbtn--solid" href="#koleksiyonlar">Koleksiyonları keşfet</Link>
            <Link className="zbtn zbtn--ghost" href="/shop">Alışverişe başla</Link>
          </div>
        </div>
        {motion && (
          <div className="cin__next" aria-hidden={false}>
            <Image src={nextImage} alt={nextAlt} fill sizes="100vw" />
            <div className="cin__next-label">
              <h2>{nextTitle}</h2>
              <Link className="zbtn zbtn--solid" href="/shop">Alışverişe başla</Link>
            </div>
          </div>
        )}
        {motion && <span className="cin__scroll" aria-hidden="true">Kaydır</span>}
      </div>
    </section>
  );
}
