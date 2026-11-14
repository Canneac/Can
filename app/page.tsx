import { HeroVideo } from "@/components/hero-video";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { StorefrontHeader } from "@/components/storefront-header";
import { brand } from "@/config/brand";
import { featuredObjects, homeCollections } from "@/data/homepage";
import { formatTryFromKurus } from "@/domain/money";

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="arrow-icon">
      <path d="M4 14 14 4M5 4h9v9" />
    </svg>
  ) : (
    <svg viewBox="0 0 26 12" aria-hidden="true" className="arrow-icon">
      <path d="M0 6h24m-5-5 5 5-5 5" />
    </svg>
  );
}

function Price({ amountInKurus }: { amountInKurus: number }) {
  return <span>{formatTryFromKurus(amountInKurus)}</span>;
}

export default function HomePage() {
  return (
    <main id="top">
      <StorefrontHeader />

      <section className="hero" aria-labelledby="hero-title">
        <Image
          src="/images/private-gallery-hero.png"
          alt="Geç ışıkla aydınlanan fildişi bir galeri, bordo heykelsi vazo ve kadife oturma alanı"
          fill
          priority
          sizes="100vw"
          className="hero__image"
        />
        <HeroVideo /><div className="hero__wash" aria-hidden="true" />
        <div className="hero__copy">
          <div className="eyebrow hero__eyebrow"><span className="eyebrow__rule" /> SEÇİLMİŞ NESNELER, KİŞİSEL MEKÂNLAR</div>
          <p className="hero__overline">{brand.signature}</p>
          <h1 id="hero-title">NUVESSA</h1>
          <p className="hero__description">Bir evden daha fazlası.</p>
          <Link className="text-link hero__link" href="/worlds">
            <span>Dünyaları keşfet</span><ArrowIcon />
          </Link>
        </div>
        <div className="hero__shop"><Link href="/shop">Alışverişe başla ↗</Link></div><div className="hero__caption" aria-hidden="true">
          <span>01 / 03</span><span className="hero__caption-line" /><span>THE PRIVATE GALLERY</span>
        </div>
        <div className="hero__side-note" aria-hidden="true">FORM · IŞIK · DOKU</div>
      </section>

      <section className="section-shell home-discovery"><h2>Evinizi keşfedin</h2><Link href="/rooms">Odaya göre ↗</Link><Link href="/shop?category=mobilya">Mobilya ↗</Link><Link href="/shop?category=mutfak">Mutfak ve sofra ↗</Link><Link href="/shop?category=temizlik">Günlük ihtiyaçlar ↗</Link></section><section className="intro section-shell" aria-labelledby="intro-title">
        <div className="intro__seal"><BrandLogo variant="monogramOnLight" decorative className="monogram" /></div>
        <p className="eyebrow">BİR SEÇKİDEN FAZLASI</p>
        <h2 id="intro-title">Mekânın hafızası,<br /><em>dokunduğunuz</em> şeylerde saklı.</h2>
        <p className="intro__note">NUVESSA; heykelsi form, derin ton ve dokunsal yüzeylerin bir araya geldiği kişisel bir galeri fikrinden doğdu.</p>
        <span className="intro__index" aria-hidden="true">N / 01</span>
      </section>

      <section className="collections section-shell" id="koleksiyonlar" aria-labelledby="collections-title">
        <div className="section-heading collections__heading">
          <div>
            <p className="eyebrow">FORMUNA GÖRE KEŞFET</p>
            <h2 id="collections-title">Bir mekânda<br /><em>iz bırakanlar.</em></h2>
          </div>
          <p className="section-heading__note">Az sayıda, güçlü bir etki.<br />Her parça kendi çevresini kurar.</p>
        </div>
        <div className="collection-grid">
          {homeCollections.map((collection) => (
            <a className={`collection-card ${collection.className}`} href={collection.href} key={collection.number}>
              <div className="collection-card__image-wrap">
                <Image src={collection.image} alt={collection.imageAlt} fill sizes="(max-width: 700px) 100vw, 45vw" className="collection-card__image" />
                <span className="collection-card__number">{collection.number}</span>
                <span className="collection-card__arrow"><ArrowIcon diagonal /></span>
              </div>
              <div className="collection-card__caption">
                <div><h3>{collection.title}</h3><p>{collection.subtitle}</p></div>
                <span className="collection-card__index">NUVESSA / 0{collection.number}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="objects section-shell" id="secim" aria-labelledby="objects-title">
        <div className="objects__intro">
          <p className="eyebrow"><span className="eyebrow__rule" /> GALERİDEN BİR SEÇKİ</p>
          <h2 id="objects-title">Yakından<br /><em>bakmaya değer.</em></h2>
          <p>Her nesne; formu, ölçeği ve çevresinde bıraktığı boşlukla düşünülür.</p>
          <span className="demo-note">Tasarım önizlemesi · Ürün adları ve fiyatlar örnektir.</span>
        </div>
        <div className="object-grid">
          {featuredObjects.map((item, index) => (
            <article className={`object-card object-card--${item.tone}`} key={item.number}>
              <div className="object-card__visual">
                <Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 700px) 84vw, 30vw" className="object-card__image" />
                <span className="object-card__number">{item.number}</span>
                <span className="object-card__art-label">NUVESSA<br />OBJECT STUDY</span>
              </div>
              <div className="object-card__details">
                <div><h3><Link href={`/products/${["aren-form-vazo", "neroli-dekor-kasesi", "esik-salon-kompozisyonu"][index]}`}>{item.name}</Link></h3><p>{item.material}</p></div>
                <Price amountInKurus={item.priceInKurus} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="room-feature" id="mekan" aria-labelledby="room-title">
        <Image
          src="/images/salon-editorial.png"
          alt="Bordo berjer, heykelsi ayna ve ceviz konsolla kurgulanmış gün ışıklı salon"
          fill
          sizes="100vw"
          className="room-feature__image"
        />
        <div className="room-feature__veil" aria-hidden="true" />
        <div className="room-feature__heading">
          <p className="eyebrow eyebrow--light">SHOP THE ROOM / 01</p>
          <h2 id="room-title">Bir odadan,<br /><em>bir hikâyeye.</em></h2>
          <p>Bu kompozisyondaki nesneleri keşfedin.</p>
        </div>
        <details className="room-hotspot room-hotspot--mirror">
          <summary aria-label="Ayna kompozisyonunun detayını göster">01</summary>
          <div className="hotspot-card"><span>01 / YÜZEY</span><strong>Antik tonlu ayna</strong><p>Örnek kompozisyon</p><a href="#secim">Seçkiye dön <ArrowIcon diagonal /></a></div>
        </details>
        <details className="room-hotspot room-hotspot--chair">
          <summary aria-label="Bordo oturma alanının detayını göster">02</summary>
          <div className="hotspot-card"><span>02 / RENK</span><strong>Bordo kadife dokusu</strong><p>Örnek kompozisyon</p><a href="#secim">Seçkiye dön <ArrowIcon diagonal /></a></div>
        </details>
        <span className="room-feature__credit">MEKÂN İNCELEMESİ / NUVESSA STUDIO</span>
      </section>

      <section className="manifesto" id="yaklasim" aria-labelledby="manifesto-title">
        <div className="manifesto__mark"><BrandLogo variant="darkSection" decorative className="primary-logo" /></div>
        <div className="manifesto__copy">
          <p className="eyebrow eyebrow--light">THE PRIVATE GALLERY</p>
          <h2 id="manifesto-title">Ev, kendinizi<br />sergilediğiniz <em>yer değil;</em><br />kendiniz olduğunuz yerdir.</h2>
          <p className="manifesto__note">Bu nedenle NUVESSA, nesnelerden önce hissi seçer. Her kompozisyon; ışık, malzeme ve oran üzerine kurulan açık uçlu bir davettir.</p>
          <a className="text-link text-link--light" href="#top"><span>Başlangıca dön</span><ArrowIcon /></a>
        </div>
        <span className="manifesto__ornament" aria-hidden="true">N</span>
      </section>

      <section className="closing-note section-shell" aria-label="NUVESSA marka notu">
        <div className="closing-note__line" />
        <p>Bir parçayı seçin.<br /><em>Ona yer açın.</em></p>
        <BrandLogo variant="monogramOnLight" decorative className="closing-note__monogram" />
      </section>

      <footer className="site-footer">
        <div className="site-footer__top">
          <a href="#top" className="site-footer__logo" aria-label="NUVESSA ana sayfa"><BrandLogo variant="footer" decorative className="footer-wordmark" /></a>
          <p>{brand.signature}<br /><span>Nesnelerle kurulan kişisel bir galeri.</span></p>
          <nav aria-label="Alt gezinme"><Link href="/worlds">Koleksiyonlar</Link><a href="#secim">Seçkiden</a><a href="#yaklasim">Yaklaşımımız</a></nav>
          <a href="#top" className="back-to-top">Yukarı dön <ArrowIcon diagonal /></a>
        </div>
        <div className="site-footer__bottom">
          <span>© NUVESSA · THE PRIVATE GALLERY</span>
          <span>Yerel tasarım önizlemesi · Gerçek sipariş veya ödeme alınmaz.</span>
          <span>İSTANBUL · TR</span>
        </div>
      </footer>
    </main>
  );
}



