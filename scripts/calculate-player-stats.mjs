import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { PLAYER_STAT_KEYS } from "../js/utils/player-stats.js";

export const CONTROLLED_VARIATION_OFFSETS = Object.freeze([-6, -2, 2, 6]);

const MIN_STAT_VALUE = 0;
const MIN_INPUT_VALUE = 1;
const MAX_STAT_VALUE = 99;

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function clamp(value) {
  return Math.min(MAX_STAT_VALUE, Math.max(MIN_STAT_VALUE, value));
}

function validateInputStats(inputStats) {
  if (!isPlainObject(inputStats)) {
    throw new TypeError("Las estadísticas de entrada deben ser un objeto.");
  }

  const keys = Object.keys(inputStats);
  if (keys.length !== 2) {
    throw new TypeError("Debes proporcionar exactamente dos estadísticas distintas.");
  }

  keys.forEach((key) => {
    if (!PLAYER_STAT_KEYS.includes(key)) {
      throw new TypeError(
        `La estadística ${key} no es válida. Usa una de: ${PLAYER_STAT_KEYS.join(", ")}.`,
      );
    }

    const value = inputStats[key];
    if (!Number.isInteger(value)) {
      throw new TypeError(`La estadística ${key} debe ser un número entero.`);
    }
    if (value < MIN_INPUT_VALUE || value > MAX_STAT_VALUE) {
      throw new RangeError(
        `La estadística ${key} debe estar entre ${MIN_INPUT_VALUE} y ${MAX_STAT_VALUE}.`,
      );
    }
  });

  return keys;
}

export function parseStatArguments(argumentsList) {
  if (!Array.isArray(argumentsList) || argumentsList.length !== 2) {
    throw new TypeError("Debes proporcionar exactamente dos argumentos CLAVE=VALOR.");
  }

  const inputStats = {};
  argumentsList.forEach((argument) => {
    const match = typeof argument === "string"
      ? argument.match(/^([^=]+)=([^=]+)$/u)
      : null;
    if (!match) {
      throw new TypeError(`El argumento ${String(argument)} debe usar el formato CLAVE=VALOR.`);
    }

    const [, key, rawValue] = match;
    if (Object.hasOwn(inputStats, key)) {
      throw new TypeError(`La estadística ${key} está repetida.`);
    }

    inputStats[key] = Number(rawValue);
  });

  validateInputStats(inputStats);
  return inputStats;
}

export function calculatePlayerStats(inputStats) {
  const inputKeys = validateInputStats(inputStats);
  const inputKeySet = new Set(inputKeys);
  const missingKeys = PLAYER_STAT_KEYS.filter((key) => !inputKeySet.has(key));
  const inputValues = inputKeys.map((key) => inputStats[key]);
  const inputTotal = sum(inputValues);
  const center = inputTotal / inputKeys.length;
  const desiredValues = CONTROLLED_VARIATION_OFFSETS.map((offset) => center + offset);
  const highestCalculatedValue = Math.min(...inputValues) - 1;
  const downwardShift = Math.max(0, Math.max(...desiredValues) - highestCalculatedValue);
  const calculatedValues = desiredValues.map((value) => clamp(Math.round(value - downwardShift)));
  const calculatedStats = Object.fromEntries(
    missingKeys.map((key, index) => [key, calculatedValues[index]]),
  );
  const stats = Object.fromEntries(
    PLAYER_STAT_KEYS.map((key) => [key, inputKeySet.has(key) ? inputStats[key] : calculatedStats[key]]),
  );
  const rating = Math.round(sum(Object.values(stats)) / PLAYER_STAT_KEYS.length);

  return { rating, stats };
}

function runCli() {
  try {
    const inputStats = parseStatArguments(process.argv.slice(2));
    console.log(JSON.stringify(calculatePlayerStats(inputStats), null, 2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("Uso: node scripts/calculate-player-stats.mjs VN=90 PR=70");
    process.exitCode = 1;
  }
}

const isDirectExecution = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  runCli();
}
