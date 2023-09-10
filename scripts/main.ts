import * as server from "@minecraft/server";

function main() {
  console.warn("Hello, world!");

  //var game = new BreakTheTerracotta();
  //world.events.tick.subscribe(game.tick.bind(game));
  server.world.afterEvents.itemStartUse.subscribe((event) => {
    console.warn(event.itemStack.typeId);
  });
}

main();
