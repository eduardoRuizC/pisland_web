import test from "node:test";
import assert from "node:assert/strict";

import {
  DRESS_CODE_PAGE_SIZE,
  getDressCodePage,
  getDressCodePageCount,
} from "../js/components/dress-code-pagination.js";

const makePhotos = (length) => Array.from({ length }, (_, index) => ({ id: index + 1 }));

test("Dress Code always paginates in groups of three", () => {
  assert.equal(DRESS_CODE_PAGE_SIZE, 3);
  assert.deepEqual(getDressCodePage(makePhotos(3), 1).items.map(({ id }) => id), [1, 2, 3]);
  assert.deepEqual(getDressCodePage(makePhotos(7), 2).items.map(({ id }) => id), [4, 5, 6]);
  assert.deepEqual(getDressCodePage(makePhotos(7), 3).items.map(({ id }) => id), [7]);
});

test("Dress Code calculates empty and populated page counts", () => {
  assert.equal(getDressCodePageCount(0), 0);
  assert.equal(getDressCodePageCount(1), 1);
  assert.equal(getDressCodePageCount(3), 1);
  assert.equal(getDressCodePageCount(4), 2);
  assert.equal(getDressCodePageCount(7), 3);
});

test("Dress Code clamps pages and represents an empty gallery", () => {
  assert.deepEqual(getDressCodePage([], 1), { page: 0, totalPages: 0, items: [] });
  assert.equal(getDressCodePage(makePhotos(4), -1).page, 1);
  assert.equal(getDressCodePage(makePhotos(4), 99).page, 2);
});
