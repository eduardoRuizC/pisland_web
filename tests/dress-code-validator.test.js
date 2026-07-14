import test from "node:test";
import assert from "node:assert/strict";

import { validateDressCodeManifest } from "../js/validation/dress-code-validator.js";

test("Dress Code accepts an empty manifest and supported image formats", () => {
  const emptyManifest = { photos: [] };
  assert.equal(validateDressCodeManifest(emptyManifest), emptyManifest);
  assert.doesNotThrow(() => validateDressCodeManifest({
    photos: [
      "look-01.jpg",
      "look_02.jpeg",
      "look-03.png",
      "look-04.webp",
      "look-05.avif",
    ],
  }));
});

test("Dress Code rejects unsafe paths, unsupported formats and non-string entries", () => {
  assert.throws(
    () => validateDressCodeManifest({ photos: ["../look.jpg"] }),
    /no es un nombre de imagen válido/u,
  );
  assert.throws(
    () => validateDressCodeManifest({ photos: ["look.svg"] }),
    /no es un nombre de imagen válido/u,
  );
  assert.throws(
    () => validateDressCodeManifest({ photos: [{ file: "look.jpg" }] }),
    /archivo de la foto/u,
  );
});

test("Dress Code rejects duplicate filenames regardless of case", () => {
  assert.throws(
    () => validateDressCodeManifest({
      photos: [
        "look.jpg",
        "LOOK.JPG",
      ],
    }),
    /repite el archivo/u,
  );
});
