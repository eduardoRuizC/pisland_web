import test from "node:test";
import assert from "node:assert/strict";

import { initExternalTrailerModal, initTrailerModal } from "../js/components/trailer-modal.js";

function createHost(source = "dialogs/welcome-v1.html") {
  const documentRef = { baseURI: "https://example.test/event/" };
  return {
    dataset: { dialogSrc: source },
    ownerDocument: documentRef,
    children: [],
    replaceChildren(...children) {
      this.children = children;
    },
  };
}

function createResponse({ ok = true, status = 200, markup = "<dialog></dialog>" } = {}) {
  return {
    ok,
    status,
    async text() {
      return markup;
    },
  };
}

test("loads the selected version, inserts it and initializes it in that order", async () => {
  const host = createHost("dialogs/welcome-v2.html");
  const parsedDialog = { kind: "dialog" };
  const events = [];
  let requestedUrl;
  let requestedOptions;
  let cleaned = false;

  const cleanup = await initExternalTrailerModal(host, {
    fetchImpl: async (url, options) => {
      requestedUrl = String(url);
      requestedOptions = options;
      events.push("fetch");
      return createResponse({ markup: "version two" });
    },
    parseDialogImpl: (markup) => {
      assert.equal(markup, "version two");
      events.push("parse");
      return parsedDialog;
    },
    initModalImpl: (dialog) => {
      assert.equal(dialog, parsedDialog);
      assert.deepEqual(host.children, [parsedDialog]);
      events.push("init");
      return () => {
        cleaned = true;
      };
    },
  });

  assert.equal(requestedUrl, "https://example.test/event/dialogs/welcome-v2.html");
  assert.equal(requestedOptions.headers.Accept, "text/html");
  assert.deepEqual(events, ["fetch", "parse", "init"]);

  cleanup();
  assert.equal(cleaned, true);
  assert.deepEqual(host.children, []);
});

test("does not initialize before the asynchronous response is complete", async () => {
  const host = createHost();
  let resolveFetch;
  let initialized = false;
  const responsePending = new Promise((resolve) => {
    resolveFetch = resolve;
  });

  const loading = initExternalTrailerModal(host, {
    fetchImpl: () => responsePending,
    parseDialogImpl: () => ({ kind: "dialog" }),
    initModalImpl: () => {
      initialized = true;
      return () => {};
    },
  });

  await Promise.resolve();
  assert.equal(initialized, false);
  assert.deepEqual(host.children, []);

  resolveFetch(createResponse());
  await loading;
  assert.equal(initialized, true);
});

test("rejects a missing version without inserting or initializing a dialog", async () => {
  const host = createHost("dialogs/missing.html");
  let initialized = false;

  await assert.rejects(
    initExternalTrailerModal(host, {
      fetchImpl: async () => createResponse({ ok: false, status: 404 }),
      parseDialogImpl: () => ({ kind: "dialog" }),
      initModalImpl: () => {
        initialized = true;
      },
    }),
    /devolvió 404/u,
  );

  assert.equal(initialized, false);
  assert.deepEqual(host.children, []);
});

test("rejects invalid markup without inserting or initializing a dialog", async () => {
  const host = createHost();
  let initialized = false;

  await assert.rejects(
    initExternalTrailerModal(host, {
      fetchImpl: async () => createResponse({ markup: "invalid" }),
      parseDialogImpl: () => {
        throw new Error("invalid dialog");
      },
      initModalImpl: () => {
        initialized = true;
      },
    }),
    /invalid dialog/u,
  );

  assert.equal(initialized, false);
  assert.deepEqual(host.children, []);
});

test("rejects cross-origin versions before requesting them", async () => {
  const host = createHost("https://other.example/dialog.html");
  let requested = false;

  await assert.rejects(
    initExternalTrailerModal(host, {
      fetchImpl: async () => {
        requested = true;
        return createResponse();
      },
    }),
    /mismo sitio/u,
  );

  assert.equal(requested, false);
  assert.deepEqual(host.children, []);
});

test("uses the field default when an announcement player image fails", () => {
  const imageListeners = new Map();
  const image = {
    dataset: { playerImageFallback: "assets/player-card-template.png" },
    src: "assets/teams/sangre-nueva/eriksinfondo.png",
    addEventListener(name, listener) {
      imageListeners.set(name, listener);
    },
    removeEventListener(name, listener) {
      if (imageListeners.get(name) === listener) imageListeners.delete(name);
    },
  };
  const classList = { add() {}, remove() {} };
  const documentRef = {
    body: { classList },
    addEventListener() {},
    removeEventListener() {},
  };
  const dialog = {
    ownerDocument: documentRef,
    open: false,
    querySelectorAll(selector) {
      return selector === "img[data-player-image]" ? [image] : [];
    },
    addEventListener() {},
    removeEventListener() {},
  };

  const cleanup = initTrailerModal(dialog, { autoOpen: false });
  imageListeners.get("error")();

  assert.equal(image.src, "assets/player-card-template.png");
  assert.equal(image.dataset.playerImageFallbackApplied, "true");

  cleanup();
  assert.equal(imageListeners.has("error"), false);
});
