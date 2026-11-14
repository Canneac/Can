import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontHeader } from "@/components/storefront-header";
import { WORLD_CONTENT } from "@/data/worlds-content";
import type { Product } from "@/domain/catalog-types";

type Props = {
  slug: string;
  name: string;
  products: Product[];
  brandName: (slug: string) => string | undefined;
  categoryName: (slug: string) => string | undefined;
};

function Cards({ slug, products, brandName, categoryName }: Props) {
  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} world={slug} brandName={brandName(product.brand)} categoryName={categoryName(product.categorySlug)} />
      ))}
    </>
  );
}

const Palette = ({ slug }: { slug: string }) => (
  <ul className="wd-palette" aria-label="Dünya renk paleti">
    {WORLD_CONTENT[slug].palette.map((color) => <li key={color.name}><i style={{ background: color.hex }} aria-hidden="true" />{color.name}</li>)}
  </ul>
);

const Empty = () => <p className="wd-empty">Bu dünyada henüz ürün yok.</p>;

/** MODERN FORM — keskin bölmeler, ince çizgiler, dik hiyerarşi, sol metin / sağ medya. */
function ModernForm(props: Props) {
  const content = WORLD_CONTENT[props.slug];
  return (
    <main className="store-page wd wd--modern">
      <StorefrontHeader />
      <section className="wdm-hero">
        <div className="wdm-hero__text">
          <p className="wd-kicker">{content.kicker}</p>
          <h1>Modern<br />Form</h1>
          <p className="wd-lead">{content.intro}</p>
          <Link className="wd-button" href="#urunler">Ürünleri gör ↓</Link>
          <Palette slug={props.slug} />
        </div>
        <div className="wdm-hero__media">
          <Image src={content.image} alt={content.imageAlt} fill priority sizes="(max-width: 900px) 100vw, 55vw" />
          <HeroVideo />
          <span className="wdm-hero__label">{content.headline}</span>
        </div>
      </section>
      <section className="wdm-highlights" aria-label="Öne çıkanlar">
        {content.highlights.map((text, index) => <div key={text}><b>0{index + 1}</b><p>{text}</p></div>)}
      </section>
      <section id="urunler" className="wdm-products">
        <h2>Seçki <small>{props.products.length} ürün</small></h2>
        {props.products.length ? <div className="catalog-grid"><Cards {...props} /></div> : <Empty />}
      </section>
      <SiteFooter />
    </main>
  );
}

/** SOFT LIVING — kemerli görsel, ortalanmış sıcak başlık, yatay kaydırmalı seçki, doğal malzeme çipleri. */
function SoftLiving(props: Props) {
  const content = WORLD_CONTENT[props.slug];
  return (
    <main className="store-page wd wd--soft">
      <StorefrontHeader />
      <section className="wds-hero">
        <p className="wd-kicker">{content.kicker}</p>
        <h1>Soft <em>Living</em></h1>
        <p className="wd-lead">{content.intro}</p>
        <div className="wds-arch"><Image src={content.image} alt={content.imageAlt} fill priority sizes="(max-width: 700px) 90vw, 520px" /></div>
        <Palette slug={props.slug} />
      </section>
      <section id="urunler" className="wds-rail-section">
        <h2>Evinize sıcaklık getirenler</h2>
        {props.products.length ? <div className="wds-rail" tabIndex={0} aria-label="Soft Living ürünleri, yatay kaydırın"><Cards {...props} /></div> : <Empty />}
        <p className="wds-hint">Kaydırarak daha fazlasını görün →</p>
      </section>
      <section className="wds-materials">
        <h2>Doğal dokulara göre</h2>
        <div>{["Kumaş", "Ahşap", "Seramik"].map((material) => <Link key={material} href={`/shop?world=soft-living&material=${encodeURIComponent(material)}#urunler`}>{material}</Link>)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}

/** HERITAGE — koyu bordo, ortada hizalı klasik başlık, çift çerçeve, iki sütunlu ciddi seçki. */
function Heritage(props: Props) {
  const content = WORLD_CONTENT[props.slug];
  return (
    <main className="store-page wd wd--heritage">
      <StorefrontHeader />
      <section className="wdh-hero">
        <Image src={content.image} alt={content.imageAlt} fill priority sizes="100vw" />
        <div className="wdh-hero__shade" aria-hidden="true" />
        <div className="wdh-frame">
          <p className="wd-kicker">{content.kicker}</p>
          <h1>Heritage</h1>
          <span className="wdh-rule" aria-hidden="true" />
          <p className="wd-lead">{content.intro}</p>
          <Link className="wd-button" href="#urunler">Seçkiyi incele</Link>
        </div>
      </section>
      <section className="wdh-intro"><Palette slug={props.slug} /><p>{content.headline}</p></section>
      <section id="urunler" className="wdh-products">
        <h2>Zamansız parçalar</h2>
        {props.products.length ? <div className="catalog-grid"><Cards {...props} /></div> : <Empty />}
      </section>
      <SiteFooter />
    </main>
  );
}

/** ART HOUSE — gece mavisi/mor, kaydırılmış dev başlık, üst üste binen bloklar, kolaj seçki. */
function ArtHouse(props: Props) {
  const content = WORLD_CONTENT[props.slug];
  return (
    <main className="store-page wd wd--art">
      <StorefrontHeader />
      <section className="wda-hero">
        <h1 aria-label="Art House"><span>ART</span><span>HOUSE</span></h1>
        <div className="wda-hero__image"><Image src={content.image} alt={content.imageAlt} fill priority sizes="(max-width: 900px) 70vw, 36vw" /></div>
        <div className="wda-hero__note">
          <p className="wd-kicker">{content.kicker}</p>
          <p className="wd-lead">{content.intro}</p>
          <Link className="wd-button" href="#urunler">Koleksiyonu keşfet ↘</Link>
        </div>
        <Palette slug={props.slug} />
      </section>
      <section id="urunler" className="wda-products">
        <h2>{content.headline}</h2>
        {props.products.length ? <div className="catalog-grid wda-collage"><Cards {...props} /></div> : <Empty />}
      </section>
      <SiteFooter />
    </main>
  );
}

export function WorldPageLayout(props: Props) {
  if (props.slug === "modern-form") return <ModernForm {...props} />;
  if (props.slug === "soft-living") return <SoftLiving {...props} />;
  if (props.slug === "heritage") return <Heritage {...props} />;
  return <ArtHouse {...props} />;
}
