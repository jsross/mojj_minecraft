import {
  Block,
  BlockPermutation,
  Direction,
  EntityHitBlockAfterEvent,
  EntityInventoryComponent,
  ItemStack,
  ItemUseAfterEvent,
  Player,
  Vector3,
} from "@minecraft/server";
import "./player_extensions";
import { AdminPickConfigModalForm } from "./admin_pick_config_modal_form";
import { Rectangle } from "./rectangle";

export class AdminPickBehavior {
  onHitBlock(event: EntityHitBlockAfterEvent): void {
    if (event.damagingEntity.typeId != "minecraft:player") {
      return;
    }
    let player = event.damagingEntity as Player;
    let heldItem = player.getHeldItem();
    let block = event.hitBlock;

    if (heldItem == null || heldItem.typeId != "mojj:adminite_pickaxe") {
      return;
    }

    let data = this.getAdminPickData(heldItem);
    let area = this.getRectangle(
      block,
      event.blockFace,
      data.width,
      data.height,
      data.length,
      player.getCardinalDirection()
    );
    let perm = BlockPermutation.resolve("air");

    let lo = area.getLowerNwCoordinates();
    let up = area.getUpperSeCoordinates();

    console.warn(
      `removing area( lo: ${lo.x}, ${lo.y}, ${lo.z}, up: ${up.x}, ${up.y}, ${up.z} ) for player ${player.name}`
    );

    block.dimension.fillBlocks(area.getLowerNwCoordinates(), area.getUpperSeCoordinates(), perm);
  }

  onUsed(event: ItemUseAfterEvent): void {
    if (event.itemStack.typeId != "mojj:adminite_pickaxe") {
      return;
    }

    var player = event.source as Player;
    var heldItem = player.getHeldItem();

    if (heldItem === null) {
      return;
    }

    var data = this.getAdminPickData(heldItem);

    let form = new AdminPickConfigModalForm(data.width, data.height, data.length);

    form.show(player).then(this.handleFormResponse.bind(this, player, heldItem));
  }

  private handleFormResponse(player: Player, heldItem: ItemStack, formData: any) {
    if (formData.formValues) {
      var data = {
        width: formData.formValues[0],
        height: formData.formValues[1],
        length: formData.formValues[2],
      };

      this.setAdminPickData(heldItem, data);

      const inventory = player.getComponent("inventory") as EntityInventoryComponent;

      inventory.container.setItem(player.selectedSlot, heldItem);
    }
  }

  private getAdminPickData(itemStack: ItemStack): any {
    var lore = itemStack.getLore();

    if (lore === undefined || lore[0] === undefined) {
      return { width: 0, height: 0, length: 0 };
    }

    var data = JSON.parse(lore[0]);

    console.warn("lore: " + lore[0]);

    return data;
  }

  private setAdminPickData(itemStack: ItemStack, data: any) {
    var lore = itemStack.getLore();

    console.warn(JSON.stringify(data));

    if (lore === undefined) {
      lore = [];
    }

    lore[0] = JSON.stringify(data);

    itemStack.setLore(lore);
  }

  private getRectangle(origin: Block, face: Direction, width: any, height: any, length: any, playerFacing: Direction) {
    let lowNw: Vector3 = this.getLowerNorthWestBlockLocation(origin, width, height, length, face, playerFacing);

    let upSe: Vector3 = this.getUpperSouthEastBlockLocation(origin, width, height, length, face, playerFacing);

    let rectangle = new Rectangle(lowNw, upSe);

    return rectangle;
  }

  private getUpperSouthEastBlockLocation(
    origin: Vector3,
    width: number,
    height: number,
    length: number,
    face: Direction,
    playerFacing: Direction
  ): Vector3 {
    let upSe: Vector3;

    switch (face) {
      case Direction.North:
        upSe = {
          x: origin.x + Math.floor(width / 2),
          y: origin.y + Math.floor(height / 2),
          z: origin.z + (length - 1),
        };
        break;
      case Direction.South:
        upSe = {
          x: origin.x + Math.floor(width / 2),
          y: origin.y + Math.floor(height / 2),
          z: origin.z,
        };
        break;
      case Direction.East:
        upSe = {
          x: origin.x,
          y: origin.y + Math.floor(height / 2),
          z: origin.z + Math.floor(width / 2),
        };

        break;
      case Direction.West:
        upSe = {
          x: origin.x + (length - 1),
          y: origin.y + Math.floor(height / 2),
          z: origin.z + Math.floor(width / 2),
        };
        break;
      case Direction.Down:
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          upSe = {
            x: origin.x + Math.floor(height / 2),
            y: origin.y,
            z: origin.z + Math.floor(width / 2),
          };
        } else {
          // North or South
          upSe = {
            x: origin.x + Math.floor(width / 2),
            y: origin.y,
            z: origin.z + Math.floor(height / 2),
          };
        }

        break;
      case Direction.Up:
        // Determine which quadrant or side of the block the player is standing on
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          upSe = {
            x: origin.x + Math.floor(height / 2),
            y: origin.y,
            z: origin.z + Math.floor(width / 2),
          };
        } else {
          // North or South
          upSe = {
            x: origin.x + Math.floor(width / 2),
            y: origin.y,
            z: origin.z + Math.floor(height / 2),
          };
        }
        break;

      default:
        throw new Error("Invalid direction provided.");
    }

    return upSe;
  }

  private getLowerNorthWestBlockLocation(
    origin: Vector3,
    width: number,
    height: number,
    length: number,
    face: Direction,
    playerFacing: Direction
  ): Vector3 {
    let loNw: Vector3;

    switch (face) {
      case Direction.North:
        loNw = {
          x: origin.x - Math.floor(width / 2),
          y: origin.y - Math.floor(height / 2),
          z: origin.z,
        };
        break;
      case Direction.South:
        loNw = {
          x: origin.x - Math.floor(width / 2),
          y: origin.y - Math.floor(height / 2),
          z: origin.z - (length - 1),
        };
        break;
      case Direction.East:
        loNw = {
          x: origin.x - (length - 1),
          y: origin.y - Math.floor(height / 2),
          z: origin.z - Math.floor(width / 2),
        };

        break;
      case Direction.West:
        loNw = {
          x: origin.x,
          y: origin.y - Math.floor(height / 2),
          z: origin.z - Math.floor(width / 2),
        };
        break;
      case Direction.Down:
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          loNw = {
            x: origin.x - Math.floor(height / 2),
            y: origin.y + (length - 1),
            z: origin.z - Math.floor(width / 2),
          };
        } else {
          // North or South
          loNw = {
            x: origin.x - Math.floor(width / 2),
            y: origin.y + (length - 1),
            z: origin.z - Math.floor(height / 2),
          };
        }

        break;
      case Direction.Up:
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          loNw = {
            x: origin.x - Math.floor(height / 2),
            y: origin.y - (length - 1),
            z: origin.z - Math.floor(width / 2),
          };
        } else {
          // North or South
          loNw = {
            x: origin.x - Math.floor(width / 2),
            y: origin.y - (length - 1),
            z: origin.z - Math.floor(height / 2),
          };
        }
        break;

      default:
        throw new Error("Invalid direction provided.");
    }

    return loNw;
  }
}
