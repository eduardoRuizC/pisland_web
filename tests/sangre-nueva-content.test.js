import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateTeam } from "../js/validation/team-validator.js";

const expectedPlayers = {
  Erik: {
    topStats: ["CA", "MS"],
    description: "Erik tiene gasolina para cualquier noche y convierte cada misión secundaria en una historia digna de contar, su resistencia y ganas de aventura mantienen a Sangre Nueva en movimiento hasta el amanecer.",
  },
  Brigitte: {
    topStats: ["PR", "PC"],
    description: "Brigitte domina el perreo y la picardía como nadie, sabe cuándo romper la pista y cuándo sacar ese giro inesperado que deja al resto de la party sin respuesta.",
  },
  Ely: {
    topStats: ["PR", "PC"],
    description: "Ely mezcla un perreo imparable con una picardía natural, una combinación que le permite encender la noche y sorprender justo cuando todos creen tenerla controlada.",
  },
  Emma: {
    topStats: ["CA", "PC"],
    description: "Emma tiene una resistencia legendaria y la picardía necesaria para escapar de cualquier lío, cuando la party se complica siempre encuentra la salida más inesperada.",
  },
  Sheila: {
    topStats: ["PR", "CA"],
    description: "Sheila lleva el perreo hasta el amanecer gracias a una capacidad de alcohol inagotable, cuando ella marca el ritmo Sangre Nueva sabe que la party todavía no ha terminado.",
  },
};

const captainDescription = "Un muro dentro del terreno, esta lejos de los focos y de los focos mediáticos, eso no quiere decir que no sea importante en la noche. Su forma de detener fácilmente hasta el jugador más experimentado a echo que sea una pieza clave en su equipo, un equipo joven lleno de energía el cual ayuda mucho con su experticia.";

test("Sangre Nueva descriptions follow each player's strongest party stats", async () => {
  const teamUrl = new URL("../teams/sangre-nueva.json", import.meta.url);
  const team = validateTeam(JSON.parse(await readFile(teamUrl, "utf8")));

  assert.equal(team.name, "Sangre Nueva");
  assert.equal(team.players.length, 6);

  Object.entries(expectedPlayers).forEach(([name, expected]) => {
    const player = team.players.find((candidate) => candidate.name === name);
    assert.ok(player, `Falta ${name} en Sangre Nueva.`);

    const topStats = Object.entries(player.stats)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 2)
      .map(([key]) => key);

    assert.deepEqual(topStats, expected.topStats);
    assert.equal(player.description, expected.description);
  });

  const captain = team.players.find((player) => player.captain);
  assert.equal(captain?.name, "Paola");
  assert.equal(captain.description, captainDescription);
});
