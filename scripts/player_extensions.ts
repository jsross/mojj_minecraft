import { Direction, EntityInventoryComponent, ItemStack, Player } from "@minecraft/server";

declare module "@minecraft/server" {
  interface Player {
    getHeldItem(): ItemStack | null;
    getCardinalDirection(): Direction;
  }
}

(Player.prototype as any).getHeldItem = function (): ItemStack | null {
  let inventory = this.getComponent("inventory") as EntityInventoryComponent;
  let heldItemSlot = this.selectedSlot;

  let heldItem = inventory.container.getItem(heldItemSlot);

  return heldItem || null;
};

(Player.prototype as any).getCardinalDirection = function (): Direction {
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
