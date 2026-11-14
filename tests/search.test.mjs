import test from "node:test";
import assert from "node:assert/strict";
import { matchesSearch, normalizeSearchText } from "../domain/search.ts";

test("Türkçe karakterli ve ASCII aramaları aynı biçime getirir", () => {
  assert.equal(normalizeSearchText("ÇÖP KOVASI"), "cop kovasi");
  assert.equal(normalizeSearchText("kaşık"), "kasik");
});

test("arama sorgusunun bütün kelimeleri katalog alanlarıyla eşleşir", () => {
  assert.equal(matchesSearch("kase bronz", ["Neroli — Dekor Kâsesi", "bronz tonlu obje"]), true);
  assert.equal(matchesSearch("sofa", ["Eşik — Salon Kompozisyonu", "salon kanepe sofa"]), true);
  assert.equal(matchesSearch("kanepE", ["Sera — Bouclé Kanepe", "kanepe koltuk sofa"]), true);
  assert.equal(matchesSearch("cop kovasi", ["Lora — Çöp Kovası", "çöp kovası günlük ihtiyaç"]), true);
  assert.equal(matchesSearch("kasik", ["Mira — Çatal Kaşık Seti", "sofra çatal kaşık"]), true);
  assert.equal(matchesSearch("buzdolabı", ["Neroli — Dekor Kâsesi"]), false);
});
