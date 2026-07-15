function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function fitText(element, options = {}) {
  if (!element) {
    const noop = () => {};
    noop.fit = noop;
    return noop;
  }

  const resolveValue = (value, fallback) => typeof value === "function" ? value() : value ?? fallback;
  const precision = options.precision ?? 0.25;
  const maxLines = options.maxLines;
  const container = options.container ?? element.parentElement ?? element;
  const windowRef = options.windowRef ?? element.ownerDocument?.defaultView;
  const ResizeObserverImpl = options.ResizeObserverImpl ?? windowRef?.ResizeObserver;
  const MutationObserverImpl = options.MutationObserverImpl ?? windowRef?.MutationObserver;
  let animationFrame;
  let destroyed = false;

  const getLineCount = () => {
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    const lineTops = new Set(
      Array.from(range.getClientRects())
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .map((rect) => Math.round(rect.top * 2) / 2),
    );
    range.detach?.();
    return lineTops.size;
  };

  const fits = () => {
    if (element.scrollWidth > element.clientWidth) return false;
    if (!Number.isFinite(maxLines)) return true;
    return getLineCount() <= maxLines;
  };

  const fitsSingleLine = () => {
    const availableWidth = element.clientWidth;
    const safetyMargin = resolveValue(options.inlineSafetyMargin, 0);
    const properties = ["position", "width", "maxWidth", "whiteSpace", "overflowWrap", "wordBreak", "flex", "visibility"];
    const previousValues = Object.fromEntries(properties.map((property) => [property, element.style[property]]));
    Object.assign(element.style, {
      position: "absolute",
      width: "max-content",
      maxWidth: "none",
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "normal",
      flex: "none",
      visibility: "hidden",
    });
    const requiredWidth = element.getBoundingClientRect().width;
    properties.forEach((property) => {
      element.style[property] = previousValues[property];
    });
    return requiredWidth <= availableWidth - safetyMargin + 0.5;
  };

  const render = () => {
    animationFrame = undefined;
    if (destroyed || !element.isConnected) return;

    const minFontSize = resolveValue(options.minFontSize, 12);
    const maxFontSize = resolveValue(options.maxFontSize, 24);

    const findLargestSize = (test) => {
      element.style.fontSize = `${maxFontSize}px`;
      if (test()) return maxFontSize;
      element.style.fontSize = `${minFontSize}px`;
      if (!test()) return undefined;

      let lowerBound = minFontSize;
      let upperBound = maxFontSize;
      while (upperBound - lowerBound > precision) {
        const candidate = (lowerBound + upperBound) / 2;
        element.style.fontSize = `${candidate}px`;
        if (test()) {
          lowerBound = candidate;
        } else {
          upperBound = candidate;
        }
      }
      return lowerBound;
    };

    const singleLineSize = options.preferSingleLine ? findLargestSize(fitsSingleLine) : undefined;
    const fittedSize = singleLineSize ?? findLargestSize(fits) ?? minFontSize;
    element.style.fontSize = `${clamp(fittedSize, minFontSize, maxFontSize).toFixed(2)}px`;
  };

  const schedule = () => {
    if (destroyed) return;
    if (animationFrame !== undefined) windowRef?.cancelAnimationFrame?.(animationFrame);
    if (windowRef?.requestAnimationFrame) {
      animationFrame = windowRef.requestAnimationFrame(render);
    } else {
      render();
    }
  };

  const resizeObserver = ResizeObserverImpl ? new ResizeObserverImpl(schedule) : undefined;
  const mutationObserver = MutationObserverImpl ? new MutationObserverImpl(schedule) : undefined;
  resizeObserver?.observe(container);
  mutationObserver?.observe(element, { childList: true, characterData: true, subtree: true });
  windowRef?.addEventListener?.("resize", schedule);
  element.ownerDocument?.fonts?.ready.then(schedule).catch(() => {});
  schedule();

  const cleanup = () => {
    destroyed = true;
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    windowRef?.removeEventListener?.("resize", schedule);
    if (animationFrame !== undefined) windowRef?.cancelAnimationFrame?.(animationFrame);
  };
  cleanup.fit = schedule;
  return cleanup;
}
