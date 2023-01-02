import { world, system, BlockLocation, MinecraftBlockTypes } from "@minecraft/server";
import * as GameTest from "@minecraft/server-gametest";

export default class Tests {
  static simpleMobTest(test: any) {
    const attackerId = "fox";
    const victimId = "chicken";

    test.spawn(attackerId, new BlockLocation(5, 2, 5));
    test.spawn(victimId, new BlockLocation(2, 2, 2));

    test.assertEntityPresentInArea(victimId, true);

    // Succeed when the victim dies
    test.succeedWhen(() => {
      test.assertEntityPresentInArea(victimId, false);
    });
  }
}
