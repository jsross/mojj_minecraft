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
  console.warn("Raw Direction value for North: " + Direction.North);
  console.warn("Raw Direction value for West: " + Direction.West);

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
  origin: Vector3,
  width: number,
  height: number,
  length: number,
  face: Direction
) {
  let begin: Vector3 = getLowerNorthWestBlockLocation(origin, width, height, length, face);

  let end: Vector3;

  switch (face) {
    case Direction.North:
    case Direction.South:
      end = {
        x: begin.x + width - 1,
        y: begin.y + height - 1,
        z: begin.z + length - 1,
      };
      break;
    case Direction.East:
    case Direction.West:
      end = {
        x: begin.x + length - 1,
        y: begin.y + height - 1,
        z: begin.z + width - 1,
      };
      break;
    case Direction.Up:
    case Direction.Down:
      end = {
        x: begin.x + length - 1,
        y: begin.y + height - 1,
        z: begin.z + width - 1,
      }; // Adjust based on the behavior you want for Up and Down
      break;
    default:
      throw new Error("Invalid direction provided.");
  }

  console.warn(
    `origin: { x: ${origin.x}, y: ${origin.y}, z: ${origin.z}} \nbegin { x: ${begin.x}, y: ${begin.y}, z: ${begin.z}},\n end: { x: ${end.x}, y: ${end.y}, z: ${end.z}}`
  );

  let perm = BlockPermutation.resolve("air");
  dimension.fillBlocks(begin, end, perm);
}

function getLowerNorthWestBlockLocation(
  origin: Vector3,
  width: number,
  height: number,
  length: number,
  face: Direction
): Vector3 {
  let begin: Vector3;

  console.warn(
    `getLowerNorthWestBlockLocation called. width: ${width}, height ${height}, length: ${length}, face: ${face})`
  );

  switch (face) {
    case Direction.North:
      console.warn("North Calc");
      begin = {
        x: origin.x - Math.floor(width / 2),
        y: origin.y - Math.floor(height / 2),
        z: origin.z,
      };
      break;
    case Direction.South:
      console.warn("South Calc");
      begin = {
        x: origin.x - Math.floor(width / 2),
        y: origin.y - Math.floor(height / 2),
        z: origin.z - (length - 1),
      };
      break;
    case Direction.East:
      console.warn("East Calc");

      begin = {
        x: origin.x - (length - 1),
        y: origin.y - Math.floor(height / 2),
        z: origin.z - Math.floor(width / 2),
      };

      break;
    case Direction.West:
      begin = {
        x: origin.x,
        y: origin.y - Math.floor(height / 2),
        z: origin.z - Math.floor(width / 2),
      };
      break;
    case Direction.Down:
      console.warn("Down Calc");
      begin = {
        x: origin.x - Math.floor(width / 2),
        y: origin.y - Math.floor(height / 2),
        z: origin.z - 2 * Math.floor(length / 2),
      };
      break;
    case Direction.Up:
      console.warn("Up Calc");
      begin = {
        x: origin.x - Math.floor(width / 2),
        y: origin.y - Math.floor(height / 2),
        z: origin.z - 2 * Math.floor(length / 2),
      };
      break;

    default:
      throw new Error("Invalid direction provided.");
  }

  console.warn(`Calculated begin for ${face}: { x: ${begin.x}, y: ${begin.y}, z: ${begin.z}}`);

  return begin;
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
