import { fitText } from "../../utils/text-fit.js?v=7";

export function createTeamTabs(teams, options = {}) {
  const documentRef = options.documentRef ?? document;
  const onSelect = options.onSelect ?? (() => {});
  const tablist = documentRef.createElement("div");
  tablist.className = "team-tabs";
  tablist.setAttribute("role", "tablist");
  tablist.setAttribute("aria-label", options.label ?? "Alineaciones del partido");

  const textFitCleanups = [];
  const tabs = teams.map((team, index) => {
    const tab = documentRef.createElement("button");
    const label = documentRef.createElement("span");
    tab.className = "team-tab";
    tab.id = `${team.id}-tab`;
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `${team.id}-panel`);
    tab.setAttribute("aria-selected", String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.dataset.teamId = team.id;
    label.className = "team-tab__label";
    label.textContent = team.name;
    tab.append(label);
    tablist.append(tab);
    textFitCleanups.push(fitText(label, {
      container: tablist,
      minFontSize: 12,
      maxFontSize: 24,
      windowRef: documentRef.defaultView,
    }));
    return tab;
  });

  function select(teamId, shouldFocus = false) {
    const selectedIndex = teams.findIndex((team) => team.id === teamId);
    if (selectedIndex < 0) return;
    tabs.forEach((tab, index) => {
      const active = index === selectedIndex;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    onSelect(teams[selectedIndex], selectedIndex);
    if (shouldFocus) tabs[selectedIndex].focus();
  }

  function handleClick(event) {
    const tab = event.target.closest("[data-team-id]");
    if (tablist.contains(tab)) select(tab.dataset.teamId);
  }

  function handleKeydown(event) {
    const currentIndex = tabs.indexOf(event.target);
    if (currentIndex < 0) return;
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    select(teams[nextIndex].id, true);
  }

  tablist.addEventListener("click", handleClick);
  tablist.addEventListener("keydown", handleKeydown);

  return {
    element: tablist,
    select,
    destroy() {
      tablist.removeEventListener("click", handleClick);
      tablist.removeEventListener("keydown", handleKeydown);
      textFitCleanups.forEach((cleanup) => cleanup());
    },
  };
}
