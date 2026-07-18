import { loadNews } from "../services/news-repository.js";
import { getNewsPage } from "./news-pagination.js";

function setStatus(status, message, type = "") {
  status.textContent = message;
  status.classList.toggle("is-warning", type === "warning");
  status.classList.toggle("is-error", type === "error");
  status.hidden = message === "";
}

function cloneTemplate(template) {
  return template?.content.cloneNode(true) ?? null;
}

function createNewsLabel(label, documentRef) {
  const element = documentRef.createElement("p");
  element.className = "live-label";

  const dot = documentRef.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  element.append(dot, label);
  return element;
}

function createNewsIcon(icon, documentRef) {
  const element = documentRef.createElement("span");
  element.className = "material-symbols-outlined card-icon";
  element.setAttribute("aria-hidden", "true");
  element.textContent = icon ?? "newspaper";
  return element;
}

function createNewsCard(newsItem, options) {
  const { documentRef, featured, featuredMediaTemplate } = options;
  const card = documentRef.createElement(newsItem.href ? "a" : "article");
  card.className = featured
    ? "news-card featured-card featured-news-card"
    : "news-card mini-card secondary-news-card";

  if (newsItem.href) {
    card.setAttribute("href", newsItem.href.trim());
  }

  if (featured) {
    const media = cloneTemplate(featuredMediaTemplate);
    if (media) card.append(media);

    const body = documentRef.createElement("div");
    body.className = "card-body";

    const title = documentRef.createElement("h3");
    title.textContent = newsItem.title;
    const description = documentRef.createElement("p");
    description.textContent = newsItem.description;
    if (newsItem.label) body.append(createNewsLabel(newsItem.label, documentRef));
    body.append(title, description);

    if (newsItem.href) {
      const cta = documentRef.createElement("span");
      cta.className = "featured-news-card__cta";
      cta.setAttribute("aria-hidden", "true");
      cta.append("Ver más");

      const arrow = documentRef.createElement("span");
      arrow.className = "material-symbols-outlined";
      arrow.textContent = "arrow_forward";
      cta.append(arrow);
      body.append(cta);
    }

    card.append(body);
    return card;
  }

  if (newsItem.label) card.append(createNewsLabel(newsItem.label, documentRef));
  card.append(createNewsIcon(newsItem.icon, documentRef));

  const title = documentRef.createElement("h3");
  title.textContent = newsItem.title;
  const description = documentRef.createElement("p");
  description.textContent = newsItem.description;
  card.append(title, description);
  return card;
}

function createPageButton(page, currentPage, documentRef) {
  const button = documentRef.createElement("button");
  button.className = "news-pagination__page";
  button.type = "button";
  button.dataset.newsPage = String(page);
  button.textContent = String(page);
  button.setAttribute("aria-label", `Ir a la página ${page}`);
  if (page === currentPage) {
    button.setAttribute("aria-current", "page");
  }
  return button;
}

export async function initNewsSection(root, options = {}) {
  if (!root) return () => {};

  const documentRef = options.documentRef ?? root.ownerDocument;
  const manifestUrl = options.manifestUrl ?? root.dataset.manifestUrl ?? "news/index.json?v=2";
  const loadNewsImpl = options.loadNewsImpl ?? loadNews;
  const status = root.querySelector("[data-news-status]");
  const grid = root.querySelector("[data-news-grid]");
  const pagination = root.querySelector("[data-news-pagination]");
  const pageButtons = root.querySelector("[data-news-pages]");
  const previousButton = root.querySelector("[data-news-previous]");
  const nextButton = root.querySelector("[data-news-next]");
  const pageStatus = root.querySelector("[data-news-page-status]");
  const featuredMediaTemplate = root.querySelector("template[data-news-featured-media]");

  if (!status || !grid || !pagination || !pageButtons || !previousButton || !nextButton || !pageStatus) {
    throw new Error("La estructura HTML de la sección de noticias está incompleta.");
  }

  let currentNews = [];
  let currentPage = 1;
  let destroyed = false;

  const renderPage = (requestedPage, focusPage = false) => {
    const result = getNewsPage(currentNews, requestedPage);
    currentPage = result.page;
    grid.classList.toggle("is-first-page", currentPage === 1);
    grid.classList.toggle("is-secondary-page", currentPage > 1);
    grid.replaceChildren(...result.items.map((newsItem, index) => createNewsCard(newsItem, {
      documentRef,
      featured: currentPage === 1 && index === 0,
      featuredMediaTemplate,
    })));

    pageButtons.replaceChildren(
      ...Array.from({ length: result.totalPages }, (_, index) => (
        createPageButton(index + 1, currentPage, documentRef)
      )),
    );
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= result.totalPages;
    pagination.hidden = result.totalPages <= 1;

    const itemLabel = currentNews.length === 1 ? "1 noticia" : `${currentNews.length} noticias`;
    pageStatus.textContent = `Página ${currentPage} de ${result.totalPages}. ${itemLabel}.`;

    if (focusPage) {
      pageButtons.querySelector(`[data-news-page="${currentPage}"]`)?.focus();
    }
  };

  const onPrevious = () => renderPage(currentPage - 1);
  const onNext = () => renderPage(currentPage + 1);
  const onPageClick = (event) => {
    const button = event.target.closest("[data-news-page]");
    if (!button || !pageButtons.contains(button)) return;
    renderPage(Number.parseInt(button.dataset.newsPage, 10), true);
  };

  previousButton.addEventListener("click", onPrevious);
  nextButton.addEventListener("click", onNext);
  pageButtons.addEventListener("click", onPageClick);
  setStatus(status, "Cargando noticias…");

  try {
    const { news, errors } = await loadNewsImpl(manifestUrl, options.fetchImpl);
    if (destroyed) return () => {};
    if (news.length === 0) {
      throw new Error("Ninguna noticia válida pudo cargarse.");
    }

    currentNews = news;
    renderPage(1);

    if (errors.length > 0) {
      const names = errors.map(({ filename }) => filename).join(", ");
      const message = errors.length === 1
        ? `No se pudo cargar 1 noticia: ${names}.`
        : `No se pudieron cargar ${errors.length} noticias: ${names}.`;
      setStatus(status, message, "warning");
      errors.forEach(({ filename, error }) => console.error(`Error al cargar ${filename}:`, error));
    } else {
      setStatus(status, "");
    }
  } catch (error) {
    grid.replaceChildren();
    pagination.hidden = true;
    pageStatus.textContent = "";
    setStatus(status, "No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.", "error");
    console.error("Error al cargar Próximos Chismes:", error);
  }

  return () => {
    destroyed = true;
    previousButton.removeEventListener("click", onPrevious);
    nextButton.removeEventListener("click", onNext);
    pageButtons.removeEventListener("click", onPageClick);
  };
}
