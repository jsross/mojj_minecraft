import { world } from "@minecraft/server";
import { Behavior } from "./behavior";

interface WorldAfterEvents {
  [eventName: string]: any;
}

export class BehaviorManager {
  private behaviors: Behavior[] = [];

  registerBehavior(behavior: Behavior): void {
    this.behaviors.push(behavior);
    this.subscribeToAfterEvents(behavior);
    this.subscribeToBeforeEvents(behavior);
  }

  private subscribeToBeforeEvents(behavior: Behavior): void {
    const eventMap = behavior.getBeforeEventMap();

    for (const [eventName, handler] of eventMap.entries()) {
      // Dynamically subscribe based on event name
      if ((world.beforeEvents as WorldAfterEvents)[eventName]) {
        (world.beforeEvents as WorldAfterEvents)[eventName].subscribe(handler.bind(behavior));
      }
    }
  }

  private subscribeToAfterEvents(behavior: Behavior): void {
    const eventMap = behavior.getAfterEventMap();

    for (const [eventName, handler] of eventMap.entries()) {
      // Dynamically subscribe based on event name
      if ((world.afterEvents as WorldAfterEvents)[eventName]) {
        (world.afterEvents as WorldAfterEvents)[eventName].subscribe(handler.bind(behavior));
      }
    }
  }
}
