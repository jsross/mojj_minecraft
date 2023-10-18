import { AdminPickBehavior } from "./admin_pick_behavior";
import { AreaCalculator } from "./area_calculator";
import { BehaviorManager } from "./behavior_manager";

function main() {
  console.warn("Hello, world 2!");

  const areaCalculator = new AreaCalculator();
  const behavior = new AdminPickBehavior(areaCalculator);
  const behaviorManager = new BehaviorManager();

  behaviorManager.registerBehavior(behavior);

  // ... rest of the code ...
}

main();
