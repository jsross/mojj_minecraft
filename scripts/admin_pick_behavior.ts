import {
  BlockPermutation,
  EntityHitBlockAfterEvent,
  EntityInventoryComponent,
  ItemStack,
  ItemUseAfterEvent,
  Player,
} from "@minecraft/server";
import "./player_extensions";
import "./entity_extensions";
import { AdminPickConfigModalForm } from "./admin_pick_config_modal_form";
import { IAreaCalculator } from "./area_calculator";
import { Behavior } from "./behavior";

export class AdminPickBehavior extends Behavior {
  private areaCalculator: IAreaCalculator;

  constructor(areaCalculator: IAreaCalculator) {
    super();

    this.areaCalculator = areaCalculator;
  }

  public onHitBlock(event: EntityHitBlockAfterEvent): void {
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
    let area = this.areaCalculator.calculateAreaForBlock(
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

  public onUsed(event: ItemUseAfterEvent): void {
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

  getAfterEventMap(): Map<string, Function> {
    const eventMap = new Map<string, Function>();
    eventMap.set("itemUse", this.onUsed);
    eventMap.set("entityHitBlock", this.onHitBlock);

    return eventMap;
  }

  getBeforeEventMap(): Map<string, Function> {
    const eventMap = new Map<string, Function>();

    return eventMap;
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
}
