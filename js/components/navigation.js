export function initNavigation(root, options = {}) {
  if (!root) return () => {};
  const documentRef = options.documentRef ?? root.ownerDocument;
  const windowRef = options.windowRef ?? documentRef.defaultView;
  const main = options.main ?? documentRef.querySelector("main");
  const breakpoint = options.desktopBreakpoint ?? 720;
  const activeOffset = options.activeOffset ?? 140;
  const toggle = root.querySelector("[data-nav-toggle]");
  const menu = root.querySelector("[data-nav-links]");
  const links = Array.from(menu?.querySelectorAll("a") ?? []);

  const setOpen = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menu" : "Abrir menu");
    menu.classList.toggle("is-open", open);
  };
  const syncActive = () => {
    const current = Array.from(main?.querySelectorAll(":scope > header[id], :scope > section[id]") ?? [])
      .filter((section) => section.getBoundingClientRect().top <= activeOffset)
      .at(-1);
    if (!current) return;
    links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`));
  };
  const handleClick = (event) => {
    if (event.target.closest("[data-nav-toggle]")) {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
      return;
    }
    if (event.target.closest("[data-nav-links] a")) setOpen(false);
    else if (menu?.classList.contains("is-open") && !event.target.closest(".top-nav")) setOpen(false);
  };
  const handleKeydown = (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) {
      setOpen(false);
      toggle?.focus();
    }
  };
  const handleResize = () => {
    if (windowRef.innerWidth >= breakpoint) setOpen(false);
  };

  documentRef.addEventListener("click", handleClick);
  documentRef.addEventListener("keydown", handleKeydown);
  windowRef.addEventListener("scroll", syncActive, { passive: true });
  windowRef.addEventListener("resize", handleResize);
  syncActive();

  return () => {
    documentRef.removeEventListener("click", handleClick);
    documentRef.removeEventListener("keydown", handleKeydown);
    windowRef.removeEventListener("scroll", syncActive);
    windowRef.removeEventListener("resize", handleResize);
  };
}
