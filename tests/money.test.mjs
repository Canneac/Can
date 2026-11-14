import test from "node:test";
import assert from "node:assert/strict";
import { formatTryFromKurus } from "../domain/money.ts";

test("Türk lirasını kuruştan Türkçe biçimde yazar", () => {
  assert.equal(formatTryFromKurus(1280000), "₺12.800");
});

test("negatif ve tam sayı olmayan tutarları reddeder", () => {
  assert.throws(() => formatTryFromKurus(-1), RangeError);
  assert.throws(() => formatTryFromKurus(12.5), RangeError);
});

test("kuruşlu tutarlar kuruşu kaybetmeden yazılır", () => {
  assert.equal(formatTryFromKurus(12345), "₺123,45");
  assert.equal(formatTryFromKurus(4990), "₺49,90");
});
