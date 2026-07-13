export function initTrailerModal(dialog, options = {}) {
  if (!dialog) return () => {};
  const documentRef = options.documentRef ?? dialog.ownerDocument;
  const storage = options.storage ?? globalThis.localStorage;
  const storageKey = options.storageKey ?? "pisland-trailer-seen";
  const closeButton = dialog.querySelector("[data-close-trailer-modal]");

  const hasSeen = () => {
    try {
      return storage?.getItem(storageKey) === "true";
    } catch (error) {
      return false;
    }
  };
  const markSeen = () => {
    try {
      storage?.setItem(storageKey, "true");
    } catch (error) {
      // El modal funciona aunque el navegador bloquee el almacenamiento.
    }
  };
  const open = () => {
    if (typeof dialog.showModal === "function" && !dialog.open) {
      dialog.showModal();
      documentRef.body.classList.add("modal-open");
    }
  };
  const close = () => {
    markSeen();
    if (dialog.open) dialog.close();
    documentRef.body.classList.remove("modal-open");
  };
  const handleDialogClick = (event) => {
    if (event.target === dialog) close();
  };
  const handleClose = () => {
    markSeen();
    documentRef.body.classList.remove("modal-open");
  };
  const handleDocumentClick = (event) => {
    if (event.target.closest("[data-open-trailer-modal]")) open();
  };

  closeButton?.addEventListener("click", close);
  dialog.addEventListener("click", handleDialogClick);
  dialog.addEventListener("close", handleClose);
  documentRef.addEventListener("click", handleDocumentClick);
  if (options.autoOpen !== false && !hasSeen()) open();

  return () => {
    closeButton?.removeEventListener("click", close);
    dialog.removeEventListener("click", handleDialogClick);
    dialog.removeEventListener("close", handleClose);
    documentRef.removeEventListener("click", handleDocumentClick);
    documentRef.body.classList.remove("modal-open");
  };
}
