import { AdminPickBehavior } from "./admin_pick_behavior";
import { AreaCalculator } from "./area_calculator";
import { BehaviorManager } from "./behavior_manager";
import { WaypointBehavior } from "./waypoint_behavior";

function main() {
  console.warn("Hello, world!");

  const areaCalculator = new AreaCalculator();
  const behaviorManager = new BehaviorManager();

  behaviorManager.registerBehavior(new AdminPickBehavior(areaCalculator));
  behaviorManager.registerBehavior(new WaypointBehavior());
}

main();
