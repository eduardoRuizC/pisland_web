import test from "node:test";
import assert from "node:assert/strict";

import { getWrappedPhotoIndex } from "../js/components/dress-code-dialog.js";

test("Dress Code dialog navigation wraps in both directions", () => {
  assert.equal(getWrappedPhotoIndex(0, -1, 4), 3);
  assert.equal(getWrappedPhotoIndex(3, 1, 4), 0);
  assert.equal(getWrappedPhotoIndex(1, 1, 4), 2);
  assert.equal(getWrappedPhotoIndex(1, -6, 4), 3);
});

test("Dress Code dialog navigation rejects an empty collection", () => {
  assert.throws(() => getWrappedPhotoIndex(0, 1, 0), /mayor que cero/u);
});
