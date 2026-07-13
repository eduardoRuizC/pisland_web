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
