import { WorldInitializeAfterEvent, world } from "@minecraft/server";
import { AdminPickBehavior } from "./admin_pick_behavior";
import { AreaCalculator } from "./area_calculator";
import { BehaviorManager } from "./behavior_manager";
import { WaypointBehavior } from "./waypoint_behavior";
import { WaypointRepository } from "./waypoint_repository";

world.afterEvents.worldInitialize.subscribe((event: WorldInitializeAfterEvent) => {
  console.warn("Hello, world!");

  const areaCalculator = new AreaCalculator();
  const behaviorManager = new BehaviorManager();
  const waypointRepository = new WaypointRepository();

  if (!waypointRepository.testRepository()) {
    waypointRepository.reset();
  }

  behaviorManager.registerBehavior(new AdminPickBehavior(areaCalculator));
  behaviorManager.registerBehavior(new WaypointBehavior(waypointRepository));
});
