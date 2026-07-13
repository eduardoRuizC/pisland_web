export function initAttendance(root, options = {}) {
  if (!root) return () => {};
  const service = options.service;
  const countNode = root.querySelector("[data-attendance-count]");
  const button = root.querySelector("[data-attendance-button]");
  const status = root.querySelector("[data-attendance-status]");
  const buttonLabel = options.buttonLabel ?? "+1 MMV";
  let destroyed = false;

  const setCount = (value) => {
    if (countNode) countNode.textContent = new Intl.NumberFormat("es-ES").format(Number.isFinite(value) ? value : 0);
  };
  const setStatus = (message = "", type = "") => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-success", type === "success");
  };
  const setLoading = (loading) => {
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? "Sumando..." : buttonLabel;
  };

  async function load() {
    setCount(0);
    if (!service?.isConfigured) {
      if (button) button.disabled = true;
      setStatus("Configura Supabase para activar el contador global.", "error");
      return;
    }
    try {
      setStatus("Cargando asistentes...");
      const count = await service.getCount();
      if (!destroyed) {
        setCount(count);
        setStatus();
      }
    } catch (error) {
      if (!destroyed) setStatus("No se pudo cargar el contador.", "error");
    }
  }

  async function handleClick() {
    if (!service?.isConfigured) return;
    try {
      setLoading(true);
      setStatus("Registrando asistencia...");
      setCount(await service.increment());
      setStatus("Asistencia sumada.", "success");
    } catch (error) {
      setStatus("No se pudo registrar. Intentalo otra vez.", "error");
    } finally {
      if (!destroyed) setLoading(false);
    }
  }

  button?.addEventListener("click", handleClick);
  load();
  return () => {
    destroyed = true;
    button?.removeEventListener("click", handleClick);
  };
}
