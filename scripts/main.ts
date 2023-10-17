import { world } from "@minecraft/server";
import { AdminPickBehavior } from "./admin_pick_behavior";

function main() {
  console.warn("Hello, world!");

  let behavior = new AdminPickBehavior();

  world.afterEvents.itemUse.subscribe(behavior.onUsed.bind(behavior));
  world.afterEvents.entityHitBlock.subscribe(behavior.onHitBlock.bind(behavior));
}

main();
