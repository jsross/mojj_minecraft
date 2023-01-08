import { world, system, BlockLocation, MinecraftBlockTypes } from "@minecraft/server";
import BreakTheTerracotta from "./BreakTheTerracotta.js";
import Tests from "./Tests.js";

function main() {
  //var game = new BreakTheTerracotta();

  //world.events.tick.subscribe(game.tick.bind(game));

  Tests.initialize();
}

main();
