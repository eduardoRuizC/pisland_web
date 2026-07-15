import test from "node:test";
import assert from "node:assert/strict";

import {
  getRequestedTeamId,
  isMatchTeamDeepLink,
} from "../js/components/match/match.js";

test("reads the requested team from a Partido deep link", () => {
  const locationRef = { search: "?team=team-c", hash: "#partido" };

  assert.equal(getRequestedTeamId(locationRef), "team-c");
  assert.equal(isMatchTeamDeepLink(locationRef), true);
});

test("does not treat unrelated anchors as Partido deep links", () => {
  const locationRef = { search: "?team=team-b", hash: "#musica" };

  assert.equal(getRequestedTeamId(locationRef), "team-b");
  assert.equal(isMatchTeamDeepLink(locationRef), false);
});

test("handles missing location data without failing", () => {
  assert.equal(getRequestedTeamId(), "");
  assert.equal(isMatchTeamDeepLink(), false);
});
