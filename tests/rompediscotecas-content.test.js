import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateTeam } from "../js/validation/team-validator.js";

const expectedPlayers = {
  Diana: {
    topStats: ["PR", "PC"],
    description: "Diana es puro perreo y picardía, una combinación explosiva que le permite romper la pista, sorprender al equipo contrario y mantener a los Rompediscotecas siempre un paso por delante.",
  },
  Nerea: {
    topStats: ["VN", "MS"],
    description: "Nerea ve cada giro de la noche antes que nadie y convierte cualquier misión secundaria en el plan principal, su energía mantiene viva la party y hace imposible saber cuál será su próxima aventura.",
  },
  Anuska: {
    topStats: ["VN", "UE"],
    description: "Anuska es los ojos y el pegamento de los Rompediscotecas, su visión de la noche y su unión de equipo consiguen que nadie se pierda y que todos lleguen juntos hasta el final.",
  },
  "Sara Hippie": {
    topStats: ["VN", "CA"],
    description: "Sara Hippie tiene una visión privilegiada de la noche y una capacidad de alcohol inagotable, dos armas con las que mantiene la calma mientras el resto de la party pierde el norte.",
  },
  "DJ Andy": {
    topStats: ["CA", "MS"],
    description: "DJ Andy convierte cada misión secundaria en el temazo de la noche, su legendaria capacidad de alcohol le permite mantener el ritmo y la cabina encendida hasta que salga el sol.",
  },
};

const captainDescription = "El martillo de los rompediscotecas , su perreocidad es la llave para desestabilizar al equipo contrario , su picardía es la que a echo que llegue a ser un delantero desequilibrante.";

test("Rompediscotecas descriptions follow each player's strongest party stats", async () => {
  const teamUrl = new URL("../teams/rompediscotecas.json", import.meta.url);
  const team = validateTeam(JSON.parse(await readFile(teamUrl, "utf8")));

  assert.equal(team.name, "Rompediscotecas");
  assert.equal(team.players.length, 6);

  Object.entries(expectedPlayers).forEach(([name, expected]) => {
    const player = team.players.find((candidate) => candidate.name === name);
    assert.ok(player, `Falta ${name} en los Rompediscotecas.`);

    const topStats = Object.entries(player.stats)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 2)
      .map(([key]) => key);

    assert.deepEqual(topStats, expected.topStats);
    assert.equal(player.description, expected.description);
  });

  const captain = team.players.find((player) => player.captain);
  assert.equal(captain?.name, "Indio");
  assert.equal(captain.description, captainDescription);
});
