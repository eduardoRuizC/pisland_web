export const FIRST_NEWS_PAGE_SIZE = 3;
export const OTHER_NEWS_PAGE_SIZE = 4;

export function getNewsPageCount(totalItems) {
  if (!Number.isInteger(totalItems) || totalItems < 0) {
    throw new RangeError("El número de noticias debe ser un entero mayor o igual que cero.");
  }
  if (totalItems === 0) return 0;
  if (totalItems <= FIRST_NEWS_PAGE_SIZE) return 1;
  return 1 + Math.ceil((totalItems - FIRST_NEWS_PAGE_SIZE) / OTHER_NEWS_PAGE_SIZE);
}

export function getNewsPage(news, requestedPage = 1) {
  if (!Array.isArray(news)) {
    throw new TypeError("Las noticias deben proporcionarse como un array.");
  }

  const totalPages = getNewsPageCount(news.length);
  if (totalPages === 0) {
    return { page: 0, totalPages: 0, items: [] };
  }

  const normalizedPage = Number.isInteger(requestedPage) ? requestedPage : 1;
  const page = Math.min(Math.max(normalizedPage, 1), totalPages);
  const start = page === 1
    ? 0
    : FIRST_NEWS_PAGE_SIZE + ((page - 2) * OTHER_NEWS_PAGE_SIZE);
  const pageSize = page === 1 ? FIRST_NEWS_PAGE_SIZE : OTHER_NEWS_PAGE_SIZE;

  return {
    page,
    totalPages,
    items: news.slice(start, start + pageSize),
  };
}
