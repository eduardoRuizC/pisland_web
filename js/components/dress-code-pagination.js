export const DRESS_CODE_PAGE_SIZE = 3;

export function getDressCodePageCount(totalPhotos) {
  if (!Number.isInteger(totalPhotos) || totalPhotos < 0) {
    throw new RangeError("El número de fotos debe ser un entero mayor o igual que cero.");
  }
  return Math.ceil(totalPhotos / DRESS_CODE_PAGE_SIZE);
}

export function getDressCodePage(photos, requestedPage = 1) {
  if (!Array.isArray(photos)) {
    throw new TypeError("Las fotos deben proporcionarse como un array.");
  }

  const totalPages = getDressCodePageCount(photos.length);
  if (totalPages === 0) {
    return { page: 0, totalPages: 0, items: [] };
  }

  const normalizedPage = Number.isInteger(requestedPage) ? requestedPage : 1;
  const page = Math.min(Math.max(normalizedPage, 1), totalPages);
  const start = (page - 1) * DRESS_CODE_PAGE_SIZE;

  return {
    page,
    totalPages,
    items: photos.slice(start, start + DRESS_CODE_PAGE_SIZE),
  };
}
