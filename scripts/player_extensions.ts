import { EntityInventoryComponent, ItemStack, Player } from "@minecraft/server";

declare module "@minecraft/server" {
  interface Player {
    getHeldItem(): ItemStack | null;
  }
}

(Player.prototype as any).getHeldItem = function (): ItemStack | null {
  let inventory = this.getComponent("inventory") as EntityInventoryComponent;
  let heldItemSlot = this.selectedSlot;

  let heldItem = inventory.container?.getItem(heldItemSlot);

  return heldItem || null;
};
