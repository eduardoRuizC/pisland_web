function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function fitText(element, options = {}) {
  if (!element) return () => {};

  const minFontSize = options.minFontSize ?? 12;
  const maxFontSize = options.maxFontSize ?? 24;
  const precision = options.precision ?? 0.25;
  const container = options.container ?? element.parentElement ?? element;
  const windowRef = options.windowRef ?? element.ownerDocument?.defaultView;
  const ResizeObserverImpl = options.ResizeObserverImpl ?? windowRef?.ResizeObserver;
  let animationFrame;
  let destroyed = false;

  const render = () => {
    animationFrame = undefined;
    if (destroyed || !element.isConnected) return;

    element.style.fontSize = `${maxFontSize}px`;
    if (element.scrollWidth <= element.clientWidth) return;

    let lowerBound = minFontSize;
    let upperBound = maxFontSize;
    while (upperBound - lowerBound > precision) {
      const candidate = (lowerBound + upperBound) / 2;
      element.style.fontSize = `${candidate}px`;
      if (element.scrollWidth <= element.clientWidth) {
        lowerBound = candidate;
      } else {
        upperBound = candidate;
      }
    }

    element.style.fontSize = `${clamp(lowerBound, minFontSize, maxFontSize).toFixed(2)}px`;
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
  resizeObserver?.observe(container);
  windowRef?.addEventListener?.("resize", schedule);
  element.ownerDocument?.fonts?.ready.then(schedule).catch(() => {});
  schedule();

  return () => {
    destroyed = true;
    resizeObserver?.disconnect();
    windowRef?.removeEventListener?.("resize", schedule);
    if (animationFrame !== undefined) windowRef?.cancelAnimationFrame?.(animationFrame);
  };
}
