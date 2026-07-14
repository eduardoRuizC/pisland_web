export function initTrailerModal(dialog, options = {}) {
  if (!dialog) return () => {};
  const documentRef = options.documentRef ?? dialog.ownerDocument;
  const closeButtons = Array.from(dialog.querySelectorAll("[data-close-trailer-modal]"));

  const open = () => {
    if (typeof dialog.showModal === "function" && !dialog.open) {
      dialog.showModal();
      documentRef.body.classList.add("modal-open");
    }
  };
  const close = () => {
    if (dialog.open) dialog.close();
    documentRef.body.classList.remove("modal-open");
  };
  const handleDialogClick = (event) => {
    if (event.target === dialog) close();
  };
  const handleClose = () => {
    documentRef.body.classList.remove("modal-open");
  };
  const handleDocumentClick = (event) => {
    if (event.target.closest("[data-open-trailer-modal]")) open();
  };

  closeButtons.forEach((button) => button.addEventListener("click", close));
  dialog.addEventListener("click", handleDialogClick);
  dialog.addEventListener("close", handleClose);
  documentRef.addEventListener("click", handleDocumentClick);
  if (options.autoOpen !== false) open();

  return () => {
    closeButtons.forEach((button) => button.removeEventListener("click", close));
    dialog.removeEventListener("click", handleDialogClick);
    dialog.removeEventListener("close", handleClose);
    documentRef.removeEventListener("click", handleDocumentClick);
    documentRef.body.classList.remove("modal-open");
  };
}

function findElementById(root, id) {
  return [...root.querySelectorAll("[id]")].find((element) => element.id === id);
}

export function createDialogFromMarkup(markup, documentRef) {
  if (typeof markup !== "string" || markup.trim() === "") {
    throw new TypeError("El fichero del diálogo está vacío.");
  }

  const normalizedMarkup = markup.trim();
  if (/<(?:html|head|body|style)\b/iu.test(normalizedMarkup)) {
    throw new Error("La versión debe ser un fragmento sin documento completo ni estilos propios.");
  }

  const template = documentRef.createElement("template");
  template.innerHTML = normalizedMarkup;

  if (template.content.querySelector("script")) {
    throw new Error("Las versiones del diálogo no pueden contener scripts.");
  }
  const topLevelElements = [...template.content.children];
  const dialogs = [...template.content.querySelectorAll("dialog[data-trailer-modal]")];
  if (topLevelElements.length !== 1 || dialogs.length !== 1 || topLevelElements[0] !== dialogs[0]) {
    throw new Error("La versión debe contener un único dialog[data-trailer-modal] como elemento raíz.");
  }

  const dialog = dialogs[0];
  const titleId = dialog.getAttribute("aria-labelledby");
  const title = titleId ? findElementById(dialog, titleId) : null;
  if (!title || !/^H[1-6]$/u.test(title.tagName) || title.textContent.trim() === "") {
    throw new Error("El diálogo debe tener un aria-labelledby que apunte a su título.");
  }
  if (!dialog.querySelector("[data-close-trailer-modal]")) {
    throw new Error("El diálogo debe incluir al menos un control data-close-trailer-modal.");
  }

  return dialog;
}

export async function initExternalTrailerModal(host, options = {}) {
  if (!host) return () => {};

  const documentRef = options.documentRef ?? host.ownerDocument;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const parseDialogImpl = options.parseDialogImpl ?? createDialogFromMarkup;
  const initModalImpl = options.initModalImpl ?? initTrailerModal;
  const source = host.dataset.dialogSrc;

  if (typeof source !== "string" || source.trim() === "") {
    throw new TypeError("El host del diálogo debe definir data-dialog-src.");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch para cargar el diálogo.");
  }

  const baseUrl = new URL(documentRef.baseURI);
  const dialogUrl = new URL(source, baseUrl);
  if (dialogUrl.origin !== baseUrl.origin) {
    throw new Error("La versión del diálogo debe pertenecer al mismo sitio.");
  }

  const response = await fetchImpl(dialogUrl, { headers: { Accept: "text/html" } });
  if (!response.ok) {
    throw new Error(`La petición a ${dialogUrl} devolvió ${response.status}.`);
  }

  const markup = await response.text();
  const dialog = parseDialogImpl(markup, documentRef);
  host.replaceChildren(dialog);
  const cleanupModal = initModalImpl(dialog, { ...options, documentRef });

  return () => {
    if (typeof cleanupModal === "function") cleanupModal();
    host.replaceChildren();
  };
}
