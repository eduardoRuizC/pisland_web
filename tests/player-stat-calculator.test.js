import test from "node:test";
import assert from "node:assert/strict";

import {
  calculatePlayerStats,
  parseStatArguments,
} from "../scripts/calculate-player-stats.mjs";
import { PLAYER_STAT_KEYS } from "../js/utils/player-stats.js";

function assertValidCalculation(result, inputStats) {
  assert.deepEqual(Object.keys(result.stats), [...PLAYER_STAT_KEYS]);
  Object.entries(inputStats).forEach(([key, value]) => {
    assert.equal(result.stats[key], value);
  });
  Object.values(result.stats).forEach((value) => {
    assert.equal(Number.isInteger(value), true);
    assert.ok(value >= 0 && value <= 99);
  });
  const inputKeys = new Set(Object.keys(inputStats));
  const highestCalculatedValue = Math.max(
    ...Object.entries(result.stats)
      .filter(([key]) => !inputKeys.has(key))
      .map(([, value]) => value),
  );
  assert.ok(highestCalculatedValue < Math.min(...Object.values(inputStats)));
  const expectedRating = Math.round(
    Object.values(result.stats).reduce((total, value) => total + value, 0)
      / PLAYER_STAT_KEYS.length,
  );
  assert.equal(result.rating, expectedRating);
}

test("calculates the representative balanced profile and rating", () => {
  assert.deepEqual(calculatePlayerStats({ VN: 90, PR: 70 }), {
    rating: 69,
    stats: {
      VN: 90,
      PR: 70,
      CA: 57,
      MS: 61,
      UE: 65,
      PC: 69,
    },
  });
});

test("keeps the result independent from input argument order", () => {
  const first = calculatePlayerStats({ VN: 90, PR: 70 });
  const reversed = calculatePlayerStats({ PR: 70, VN: 90 });
  assert.deepEqual(reversed, first);
  assert.deepEqual(parseStatArguments(["PR=70", "VN=90"]), { PR: 70, VN: 90 });
});

test("supports every pair of Pisland stats in canonical output order", () => {
  for (let firstIndex = 0; firstIndex < PLAYER_STAT_KEYS.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < PLAYER_STAT_KEYS.length; secondIndex += 1) {
      const inputStats = {
        [PLAYER_STAT_KEYS[firstIndex]]: 72,
        [PLAYER_STAT_KEYS[secondIndex]]: 88,
      };
      const result = calculatePlayerStats(inputStats);
      assertValidCalculation(result, inputStats);
      assert.equal(result.rating, 70);
      assert.equal(
        Object.values(result.stats).reduce((total, value) => total + value, 0),
        420,
      );
    }
  }
});

test("keeps the supplied stats strictly highest and rounds the resulting rating", () => {
  const result = calculatePlayerStats({ VN: 81, PR: 80 });
  assert.deepEqual(result, {
    rating: 76,
    stats: {
      VN: 81,
      PR: 80,
      CA: 67,
      MS: 71,
      UE: 75,
      PC: 79,
    },
  });
  assert.equal(Object.values(result.stats).reduce((total, value) => total + value, 0), 453);
});

test("keeps extreme and near-boundary results inside 0-99", () => {
  assert.deepEqual(calculatePlayerStats({ VN: 1, PR: 1 }).stats, {
    VN: 1,
    PR: 1,
    CA: 0,
    MS: 0,
    UE: 0,
    PC: 0,
  });
  assert.deepEqual(calculatePlayerStats({ VN: 99, PR: 99 }).stats, {
    VN: 99,
    PR: 99,
    CA: 86,
    MS: 90,
    UE: 94,
    PC: 98,
  });

  [
    { VN: 1, PR: 10 },
    { VN: 90, PR: 99 },
    { UE: 2, PC: 1 },
    { CA: 98, MS: 99 },
  ].forEach((inputStats) => assertValidCalculation(calculatePlayerStats(inputStats), inputStats));
});

test("never generates 100 for the Genesis input values", () => {
  assert.deepEqual(calculatePlayerStats({ VN: 93, PR: 95 }), {
    rating: 89,
    stats: {
      VN: 93,
      PR: 95,
      CA: 80,
      MS: 84,
      UE: 88,
      PC: 92,
    },
  });
});

test("rejects invalid function inputs", () => {
  assert.throws(() => calculatePlayerStats(null), /deben ser un objeto/u);
  assert.throws(() => calculatePlayerStats({ VN: 90 }), /exactamente dos/u);
  assert.throws(() => calculatePlayerStats({ VN: 90, PR: 70, CA: 80 }), /exactamente dos/u);
  assert.throws(() => calculatePlayerStats({ VN: 90, XX: 70 }), /no es válida/u);
  assert.throws(() => calculatePlayerStats({ VN: 90.5, PR: 70 }), /número entero/u);
  assert.throws(() => calculatePlayerStats({ VN: 0, PR: 70 }), /entre 1 y 99/u);
  assert.throws(() => calculatePlayerStats({ VN: 90, PR: 100 }), /entre 1 y 99/u);
});

test("rejects malformed and repeated CLI arguments", () => {
  assert.throws(() => parseStatArguments(["VN=90"]), /exactamente dos argumentos/u);
  assert.throws(() => parseStatArguments(["VN=90", "VN=70"]), /está repetida/u);
  assert.throws(() => parseStatArguments(["VN:90", "PR=70"]), /formato CLAVE=VALOR/u);
  assert.throws(() => parseStatArguments(["VN=noventa", "PR=70"]), /número entero/u);
  assert.throws(() => parseStatArguments(["VN=0", "PR=70"]), /entre 1 y 99/u);
  assert.throws(() => parseStatArguments(["VN=90", "PR=100"]), /entre 1 y 99/u);
});
