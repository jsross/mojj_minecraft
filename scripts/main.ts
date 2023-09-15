import {
  Player,
  world,
  ItemStack,
  EntityInventoryComponent,
  ItemUseAfterEvent,
  EntityHitBlockAfterEvent,
  Block,
  Direction,
  Vector3,
  Dimension,
  Vector,
  BlockPermutation,
} from "@minecraft/server";
import { AdminPickConfigModalForm } from "./admin_pick_config_modal_form";

function main() {
  console.warn("Hello, world!");

  world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
    var player = event.source as Player;

    switch (event.itemStack.typeId) {
      case "mojj:adminite_pickaxe":
        onAdminite_pickaxe_used(player, player.selectedSlot, event.itemStack);

        break;
    }
  });

  world.afterEvents.entityHitBlock.subscribe((event: EntityHitBlockAfterEvent) => {
    if (event.damagingEntity.typeId == "minecraft:player") {
      let heldItem = getHeldItem(event.damagingEntity as Player);

      if (heldItem != undefined && heldItem.typeId === "mojj:adminite_pickaxe") {
        console.warn("Adminite Pickaxe hit: " + event.blockFace);
        onAdminitePickaxeHitBlock(heldItem, event.hitBlock, event.blockFace);
      }
    }
  });
}

main();

function onAdminitePickaxeHitBlock(itemStack: ItemStack, block: Block, direction: Direction) {
  let data = getAdminPickData(itemStack);

  var anchor = {
    x: block.x,
    y: block.y,
    z: block.z,
  };

  removeBlocks(block.dimension, anchor, data.width, data.height, data.length, direction);
}

function removeBlocks(
  dimension: Dimension,
  anchor: Vector3,
  width: number,
  height: number,
  length: number,
  direction: Direction
) {
  let begin;
  let end;

  switch (direction) {
    case Direction.North:
      end = {
        x: anchor.x + Math.ceil(width / 2),
        y: anchor.y + height,
        z: Math.ceil(anchor.z - length / 2),
      };

      begin = {
        x: anchor.x - Math.ceil(width / 2),
        y: anchor.y,
        z: anchor.z + Math.ceil(length / 2),
      };
      break;
    case Direction.South:
      end = {
        x: anchor.x + Math.ceil(width / 2),
        y: anchor.y + height,
        z: anchor.z + Math.ceil(length / 2),
      };

      begin = {
        x: anchor.x - Math.ceil(width / 2),
        y: anchor.y,
        z: anchor.z - Math.ceil(length / 2),
      };
      break;
    case Direction.East:
      end = {
        x: anchor.x + Math.ceil(length / 2),
        y: anchor.y + height,
        z: anchor.z + Math.ceil(width / 2),
      };

      begin = {
        x: anchor.x - Math.ceil(length / 2),
        y: anchor.y,
        z: anchor.z - Math.ceil(width / 2),
      };
      break;
    case Direction.West:
      end = {
        x: anchor.x - Math.ceil(length / 2),
        y: anchor.y + height,
        z: anchor.z + Math.ceil(width / 2),
      };

      begin = {
        x: anchor.x + Math.ceil(length / 2),
        y: anchor.y,
        z: anchor.z - Math.ceil(width / 2),
      };
      break;
    case Direction.Up:
      end = {
        x: anchor.x + width / 2,
        y: anchor.y + height,
        z: anchor.z + length / 2,
      };

      begin = {
        x: anchor.x - Math.ceil(width / 2),
        y: anchor.y,
        z: anchor.z - Math.ceil(length / 2),
      };
      break;
    case Direction.Down:
      end = {
        x: anchor.x + Math.ceil(width / 2),
        y: anchor.y,
        z: anchor.z + Math.ceil(length / 2),
      };

      begin = {
        x: anchor.x - Math.ceil(width / 2),
        y: anchor.y - height,
        z: anchor.z - Math.ceil(length / 2),
      };
      break;
    default:
      throw new Error("Invalid direction provided.");
  }

  console.warn(
    `fillBlocks: begin { x: ${begin.x}, y: ${begin.y}, z: ${begin.z}}, end: { x: ${end.x}, y: ${end.y}, z: ${end.z}}`
  );
  let perm = BlockPermutation.resolve("air");
  dimension.fillBlocks(end, begin, perm);
}

function onAdminite_pickaxe_used(player: Player, slot: number, itemStack: ItemStack) {
  var data = getAdminPickData(itemStack);

  let form = new AdminPickConfigModalForm(data.width, data.height, data.length);

  form
    .show(player)
    .then((formData: any) => {
      if (formData.formValues) {
        var data = {
          width: formData.formValues[0],
          height: formData.formValues[1],
          length: formData.formValues[2],
        };

        setAdminPickData(itemStack, data);

        const inventory = player.getComponent("inventory") as EntityInventoryComponent;

        inventory.container.setItem(slot, itemStack);
      }
    })
    .catch((error: Error) => {
      console.error("Failed to show form: " + error);
    });
}

function getAdminPickData(itemStack: ItemStack): any {
  var lore = itemStack.getLore();

  if (lore === undefined || lore[0] === undefined) {
    return { width: 0, height: 0, length: 0 };
  }

  var data = JSON.parse(lore[0]);

  console.warn("lore: " + lore[0]);

  return data;
}

function setAdminPickData(itemStack: ItemStack, data: any) {
  var lore = itemStack.getLore();

  console.warn(JSON.stringify(data));

  if (lore === undefined) {
    lore = [];
  }

  lore[0] = JSON.stringify(data);

  itemStack.setLore(lore);
}

function getHeldItem(player: Player): ItemStack | undefined {
  let inventory = player.getComponent("inventory") as EntityInventoryComponent;
  let heldItemSlot = player.selectedSlot;

  let heldItem = inventory.container.getItem(heldItemSlot);

  return heldItem;
}
