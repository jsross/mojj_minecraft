import { world, system, BlockLocation, MinecraftBlockTypes } from "@minecraft/server";
import * as GameTest from "@minecraft/server-gametest";
import Utilities from "./Utilities.js";
import BreakTheTerracotta from "./BreakTheTerracotta.js";
import Tests from "./Tests.js";

function main() {
  var game = new BreakTheTerracotta();

  //world.events.tick.subscribe(game.tick.bind(game));

  // Registration Code for our test
  GameTest.register("StarterTests", "simpleMobTest", Tests.simpleMobTest)
    .maxTicks(410)
    .structureName("startertests:mediumglass");
}

main();
