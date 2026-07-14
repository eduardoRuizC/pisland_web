let dialogSequence = 0;

function createIconButton(documentRef, className, icon, label) {
  const button = documentRef.createElement("button");
  const iconElement = documentRef.createElement("span");
  button.className = className;
  button.type = "button";
  button.setAttribute("aria-label", label);
  iconElement.className = "material-symbols-outlined";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;
  button.append(iconElement);
  return button;
}

export function getWrappedPhotoIndex(currentIndex, offset, totalPhotos) {
  if (!Number.isInteger(totalPhotos) || totalPhotos <= 0) {
    throw new RangeError("El total de fotos debe ser un entero mayor que cero.");
  }
  return ((currentIndex + offset) % totalPhotos + totalPhotos) % totalPhotos;
}

export function createDressCodeDialog(photos, options = {}) {
  if (!Array.isArray(photos) || photos.length === 0) {
    throw new TypeError("El diálogo necesita al menos una foto.");
  }

  const documentRef = options.documentRef ?? document;
  const dialog = documentRef.createElement("dialog");
  const media = documentRef.createElement("div");
  const image = documentRef.createElement("img");
  const fallback = documentRef.createElement("div");
  const fallbackIcon = documentRef.createElement("span");
  const fallbackCopy = documentRef.createElement("span");
  const closeButton = createIconButton(
    documentRef,
    "dress-code-dialog__close",
    "close",
    "Cerrar foto ampliada",
  );
  const previousButton = createIconButton(
    documentRef,
    "dress-code-dialog__nav dress-code-dialog__nav--previous",
    "chevron_left",
    "Foto anterior",
  );
  const nextButton = createIconButton(
    documentRef,
    "dress-code-dialog__nav dress-code-dialog__nav--next",
    "chevron_right",
    "Foto siguiente",
  );
  const announcement = documentRef.createElement("p");
  const instanceId = ++dialogSequence;
  let currentIndex = 0;
  let lastTrigger;

  dialog.className = "dress-code-dialog";
  dialog.dataset.dressCodeDialog = "";
  dialog.setAttribute("aria-label", "Foto ampliada de Dress Code");
  media.className = "dress-code-dialog__media";
  image.className = "dress-code-dialog__image";
  image.id = `dress-code-dialog-image-${instanceId}`;
  fallback.className = "dress-code-dialog__fallback";
  fallback.hidden = true;
  fallback.setAttribute("role", "img");
  fallbackIcon.className = "material-symbols-outlined";
  fallbackIcon.setAttribute("aria-hidden", "true");
  fallbackIcon.textContent = "broken_image";
  fallbackCopy.textContent = "Imagen no disponible";
  fallback.append(fallbackIcon, fallbackCopy);
  announcement.className = "sr-only";
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  previousButton.setAttribute("aria-controls", image.id);
  nextButton.setAttribute("aria-controls", image.id);
  media.append(image, fallback);
  dialog.append(media, previousButton, nextButton, closeButton, announcement);

  const render = (announce = false) => {
    const photo = photos[currentIndex];
    const previousPhoto = photos[getWrappedPhotoIndex(currentIndex, -1, photos.length)];
    const nextPhoto = photos[getWrappedPhotoIndex(currentIndex, 1, photos.length)];
    const canNavigate = photos.length > 1;

    image.hidden = false;
    fallback.hidden = true;
    image.alt = photo.alt;
    image.removeAttribute("src");
    image.src = photo.src;
    fallback.setAttribute("aria-label", `Imagen no disponible: ${photo.alt}`);
    previousButton.disabled = !canNavigate;
    nextButton.disabled = !canNavigate;
    previousButton.setAttribute(
      "aria-label",
      canNavigate ? `Foto anterior: ${previousPhoto.alt}` : "No hay otra foto",
    );
    nextButton.setAttribute(
      "aria-label",
      canNavigate ? `Foto siguiente: ${nextPhoto.alt}` : "No hay otra foto",
    );
    if (announce) {
      announcement.textContent = `${photo.alt}. Foto ${currentIndex + 1} de ${photos.length}.`;
    }
  };

  const navigate = (offset) => {
    if (photos.length < 2) return;
    currentIndex = getWrappedPhotoIndex(currentIndex, offset, photos.length);
    render(true);
  };
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const handleImageError = () => {
    image.hidden = true;
    fallback.hidden = false;
  };
  const handleBackdropClick = (event) => {
    if (event.target === dialog) close();
  };
  const handleClose = () => {
    documentRef.body.classList.remove("modal-open");
    if (lastTrigger?.isConnected) lastTrigger.focus();
  };
  const handleKeydown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    }
  };
  const handlePreviousClick = () => navigate(-1);
  const handleNextClick = () => navigate(1);

  image.addEventListener("error", handleImageError);
  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", handlePreviousClick);
  nextButton.addEventListener("click", handleNextClick);
  dialog.addEventListener("click", handleBackdropClick);
  dialog.addEventListener("close", handleClose);
  dialog.addEventListener("keydown", handleKeydown);

  const open = (photoIndex, trigger) => {
    if (!Number.isInteger(photoIndex) || photoIndex < 0 || photoIndex >= photos.length) {
      return false;
    }
    currentIndex = photoIndex;
    lastTrigger = trigger ?? documentRef.activeElement;
    announcement.textContent = "";
    render();

    if (typeof dialog.showModal === "function" && !dialog.open) {
      dialog.showModal();
      documentRef.body.classList.add("modal-open");
      closeButton.focus();
    }
    return true;
  };

  const destroy = () => {
    image.removeEventListener("error", handleImageError);
    closeButton.removeEventListener("click", close);
    previousButton.removeEventListener("click", handlePreviousClick);
    nextButton.removeEventListener("click", handleNextClick);
    dialog.removeEventListener("click", handleBackdropClick);
    dialog.removeEventListener("close", handleClose);
    dialog.removeEventListener("keydown", handleKeydown);
    if (dialog.open) dialog.close();
    documentRef.body.classList.remove("modal-open");
    dialog.remove();
  };

  return { element: dialog, open, destroy };
}
