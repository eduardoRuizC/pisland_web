import test from "node:test";
import assert from "node:assert/strict";

import { getNewsPage, getNewsPageCount } from "../js/components/news-pagination.js";

const makeNews = (length) => Array.from({ length }, (_, index) => ({ id: index + 1 }));

test("the first page contains at most three items", () => {
  assert.deepEqual(getNewsPage(makeNews(3), 1).items.map(({ id }) => id), [1, 2, 3]);
  assert.deepEqual(getNewsPage(makeNews(4), 1).items.map(({ id }) => id), [1, 2, 3]);
});

test("later pages contain consecutive groups of four", () => {
  assert.deepEqual(getNewsPage(makeNews(4), 2).items.map(({ id }) => id), [4]);
  assert.deepEqual(getNewsPage(makeNews(7), 2).items.map(({ id }) => id), [4, 5, 6, 7]);
  assert.deepEqual(getNewsPage(makeNews(8), 2).items.map(({ id }) => id), [4, 5, 6, 7]);
  assert.deepEqual(getNewsPage(makeNews(8), 3).items.map(({ id }) => id), [8]);
});

test("page counts account for the smaller first page", () => {
  assert.equal(getNewsPageCount(0), 0);
  assert.equal(getNewsPageCount(3), 1);
  assert.equal(getNewsPageCount(4), 2);
  assert.equal(getNewsPageCount(7), 2);
  assert.equal(getNewsPageCount(8), 3);
});

test("out-of-range pages are clamped", () => {
  assert.equal(getNewsPage(makeNews(8), -1).page, 1);
  assert.equal(getNewsPage(makeNews(8), 99).page, 3);
});
