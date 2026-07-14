import { loadDressCode } from "../services/dress-code-repository.js";
import { createDressCodeDialog } from "./dress-code-dialog.js";
import { DRESS_CODE_PAGE_SIZE, getDressCodePage } from "./dress-code-pagination.js";

const EMPTY_MESSAGE = "Próximamente: las fotos del Dress Code estarán disponibles aquí.";

function setStatus(status, message, type = "") {
  status.textContent = message;
  status.classList.toggle("is-empty", type === "empty");
  status.classList.toggle("is-error", type === "error");
  status.hidden = message === "";
}

function createPageButton(page, currentPage, documentRef) {
  const button = documentRef.createElement("button");
  button.className = "dress-code-pagination__page";
  button.type = "button";
  button.dataset.dressCodePage = String(page);
  button.textContent = String(page);
  button.setAttribute("aria-label", `Ir a la página ${page} de Dress Code`);
  if (page === currentPage) button.setAttribute("aria-current", "page");
  return button;
}

function createPhotoCard(photo, photoIndex, featured, documentRef) {
  const card = documentRef.createElement("button");
  const image = documentRef.createElement("img");
  const fallback = documentRef.createElement("span");
  const fallbackIcon = documentRef.createElement("span");
  const fallbackCopy = documentRef.createElement("span");

  card.className = `dress-code-card${featured ? " is-featured" : ""}`;
  card.type = "button";
  card.dataset.dressCodeIndex = String(photoIndex);
  card.setAttribute("aria-label", `Ampliar foto: ${photo.alt}`);
  image.src = photo.src;
  image.alt = photo.alt;
  image.loading = featured ? "eager" : "lazy";
  image.decoding = "async";
  fallback.className = "dress-code-card__fallback";
  fallback.hidden = true;
  fallbackIcon.className = "material-symbols-outlined";
  fallbackIcon.setAttribute("aria-hidden", "true");
  fallbackIcon.textContent = "broken_image";
  fallbackCopy.textContent = "Imagen no disponible";
  fallback.append(fallbackIcon, fallbackCopy);
  image.addEventListener("error", () => {
    image.hidden = true;
    fallback.hidden = false;
    card.classList.add("is-image-error");
  }, { once: true });
  card.append(image, fallback);
  return card;
}

export async function initDressCodeSection(root, options = {}) {
  if (!root) return () => {};

  const documentRef = options.documentRef ?? root.ownerDocument;
  const manifestUrl = options.manifestUrl
    ?? root.dataset.manifestUrl
    ?? "assets/dress-code/index.json";
  const loadDressCodeImpl = options.loadDressCodeImpl ?? loadDressCode;
  const createDialogImpl = options.createDialogImpl ?? createDressCodeDialog;
  const status = root.querySelector("[data-dress-code-status]");
  const grid = root.querySelector("[data-dress-code-grid]");
  const pagination = root.querySelector("[data-dress-code-pagination]");
  const pageButtons = root.querySelector("[data-dress-code-pages]");
  const previousButton = root.querySelector("[data-dress-code-previous]");
  const nextButton = root.querySelector("[data-dress-code-next]");
  const pageStatus = root.querySelector("[data-dress-code-page-status]");

  if (!status || !grid || !pagination || !pageButtons || !previousButton || !nextButton || !pageStatus) {
    throw new Error("La estructura HTML de la sección Dress Code está incompleta.");
  }

  let photos = [];
  let currentPage = 1;
  let dialogController;
  let destroyed = false;

  const renderPage = (requestedPage, focusPage = false) => {
    const result = getDressCodePage(photos, requestedPage);
    currentPage = result.page;
    const firstPhotoIndex = (currentPage - 1) * DRESS_CODE_PAGE_SIZE;
    grid.replaceChildren(...result.items.map((photo, index) => (
      createPhotoCard(photo, firstPhotoIndex + index, index === 0, documentRef)
    )));
    pageButtons.replaceChildren(
      ...Array.from({ length: result.totalPages }, (_, index) => (
        createPageButton(index + 1, currentPage, documentRef)
      )),
    );
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= result.totalPages;
    pagination.hidden = result.totalPages <= 1;
    pageStatus.textContent = `Página ${currentPage} de ${result.totalPages}. ${photos.length} ${photos.length === 1 ? "foto" : "fotos"}.`;

    if (focusPage) {
      pageButtons.querySelector(`[data-dress-code-page="${currentPage}"]`)?.focus();
    }
  };

  const handleGridClick = (event) => {
    const card = event.target.closest("[data-dress-code-index]");
    if (!card || !grid.contains(card)) return;
    dialogController?.open(Number.parseInt(card.dataset.dressCodeIndex, 10), card);
  };
  const handlePrevious = () => renderPage(currentPage - 1);
  const handleNext = () => renderPage(currentPage + 1);
  const handlePageClick = (event) => {
    const button = event.target.closest("[data-dress-code-page]");
    if (!button || !pageButtons.contains(button)) return;
    renderPage(Number.parseInt(button.dataset.dressCodePage, 10), true);
  };

  grid.addEventListener("click", handleGridClick);
  previousButton.addEventListener("click", handlePrevious);
  nextButton.addEventListener("click", handleNext);
  pageButtons.addEventListener("click", handlePageClick);
  setStatus(status, "Cargando fotos…");

  try {
    photos = await loadDressCodeImpl(manifestUrl, options.fetchImpl);
    if (destroyed) return () => {};

    if (photos.length === 0) {
      grid.replaceChildren();
      pagination.hidden = true;
      pageStatus.textContent = "";
      setStatus(status, EMPTY_MESSAGE, "empty");
    } else {
      dialogController = createDialogImpl(photos, { documentRef });
      documentRef.body.append(dialogController.element);
      renderPage(1);
      setStatus(status, "");
    }
  } catch (error) {
    grid.replaceChildren();
    pagination.hidden = true;
    pageStatus.textContent = "";
    setStatus(status, "No se pudieron cargar las fotos. Inténtalo de nuevo más tarde.", "error");
    console.error("Error al cargar Dress Code:", error);
  }

  return () => {
    destroyed = true;
    grid.removeEventListener("click", handleGridClick);
    previousButton.removeEventListener("click", handlePrevious);
    nextButton.removeEventListener("click", handleNext);
    pageButtons.removeEventListener("click", handlePageClick);
    dialogController?.destroy();
  };
}
