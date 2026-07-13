let hexbinSequence = 0;

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const AXIS_COUNT = 6;

function createSvgNode(documentRef, tagName, attributes = {}) {
  const node = documentRef.createElementNS(SVG_NAMESPACE, tagName);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
  return node;
}

function getPoint(index, radius) {
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  return {
    x: 180 + Math.cos(angle) * radius,
    y: 155 + Math.sin(angle) * radius,
  };
}

function getPolygonPoints(radius) {
  return Array.from({ length: AXIS_COUNT }, (_, index) => {
    const point = getPoint(index, radius);
    return `${point.x},${point.y}`;
  }).join(" ");
}

export function createStatsHexbin(stats, options = {}) {
  const documentRef = options.documentRef ?? document;
  const entries = Object.entries(stats).slice(0, AXIS_COUNT);
  const axes = Array.from({ length: AXIS_COUNT }, (_, index) => entries[index] ?? ["", 0]);
  const instanceId = ++hexbinSequence;
  const titleId = `stats-hexbin-title-${instanceId}`;
  const descriptionId = `stats-hexbin-description-${instanceId}`;
  const svg = createSvgNode(documentRef, "svg", {
    class: "player-dialog__hexbin-svg",
    viewBox: "0 0 360 310",
    role: "img",
    "aria-labelledby": `${titleId} ${descriptionId}`,
  });
  const title = createSvgNode(documentRef, "title", { id: titleId });
  const description = createSvgNode(documentRef, "desc", { id: descriptionId });
  title.textContent = "Gráfico hexagonal de estadísticas";
  description.textContent = axes
    .filter(([label]) => label)
    .map(([label, value]) => `${label}: ${value} de 100`)
    .join(", ");
  svg.append(title, description);

  [0.25, 0.5, 0.75, 1].forEach((level) => {
    svg.append(createSvgNode(documentRef, "polygon", {
      class: "player-dialog__hexbin-grid",
      points: getPolygonPoints(94 * level),
      "aria-hidden": "true",
    }));
  });

  axes.forEach((_, index) => {
    const point = getPoint(index, 94);
    svg.append(createSvgNode(documentRef, "line", {
      class: "player-dialog__hexbin-axis",
      x1: 180,
      y1: 155,
      x2: point.x,
      y2: point.y,
      "aria-hidden": "true",
    }));
  });

  const valuePoints = axes.map(([, value], index) => {
    const normalizedValue = Math.min(100, Math.max(0, Number(value))) / 100;
    const point = getPoint(index, 94 * normalizedValue);
    return `${point.x},${point.y}`;
  }).join(" ");
  svg.append(createSvgNode(documentRef, "polygon", {
    class: "player-dialog__hexbin-value",
    points: valuePoints,
    "aria-hidden": "true",
  }));
  svg.append(createSvgNode(documentRef, "circle", {
    class: "player-dialog__hexbin-center",
    cx: 180,
    cy: 155,
    r: 3,
    "aria-hidden": "true",
  }));

  axes.forEach(([label, value], index) => {
    if (!label) return;
    const point = getPoint(index, 124);
    const text = createSvgNode(documentRef, "text", {
      class: "player-dialog__hexbin-label",
      x: point.x,
      y: point.y - 4,
      "text-anchor": point.x > 195 ? "start" : point.x < 165 ? "end" : "middle",
      "aria-hidden": "true",
    });
    const labelNode = createSvgNode(documentRef, "tspan", { x: point.x });
    const valueNode = createSvgNode(documentRef, "tspan", { x: point.x, dy: 17 });
    labelNode.textContent = label;
    valueNode.classList.add("player-dialog__hexbin-label-value");
    valueNode.textContent = String(value);
    text.append(labelNode, valueNode);
    svg.append(text);
  });

  return svg;
}
