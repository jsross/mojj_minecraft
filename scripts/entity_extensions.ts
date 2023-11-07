import { Direction, Entity } from "@minecraft/server";

declare module "@minecraft/server" {
  interface Entity {
    getCardinalDirection(): Direction;
  }
}

(Entity.prototype as any).getCardinalDirection = function (): Direction {
  var rotation = this.getRotation().y;

  if (rotation >= 45 && rotation <= 135) {
    return Direction.West;
  } else if (rotation <= -45 && rotation >= -135) {
    return Direction.East;
  } else if (rotation < 45 && rotation > -45) {
    return Direction.South;
  }

  return Direction.North;
};
