import { world } from "@minecraft/server";
import { Behavior } from "./behavior";

interface WorldAfterEvents {
  [eventName: string]: any;
}

export class BehaviorManager {
  private behaviors: Behavior[] = [];

  registerBehavior(behavior: Behavior): void {
    this.behaviors.push(behavior);
    this.subscribeToEvents(behavior);
  }

  private subscribeToEvents(behavior: Behavior): void {
    const eventMap = behavior.getEventMap();
    for (const [eventName, handler] of eventMap.entries()) {
      // Dynamically subscribe based on event name
      if ((world.afterEvents as WorldAfterEvents)[eventName]) {
        (world.afterEvents as WorldAfterEvents)[eventName].subscribe(handler.bind(behavior));
      }
    }
  }
}
