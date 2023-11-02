import { ItemStack, Player, PlayerInteractWithEntityAfterEvent, EntityQueryOptions, Entity } from "@minecraft/server";
import "./player_extensions";

import { Behavior } from "./behavior";
import { WaypointModalForm } from "./waypoint_modal_form";

export class WaypointBehavior extends Behavior {
  constructor() {
    super();
  }

  public onPlayerInteract(event: PlayerInteractWithEntityAfterEvent): void {
    if (event.target.typeId != "mojj:waypoint") {
      return;
    }

    const player = event.player;
    const target = event.target;

    const options = { type: "mojj:waypoint" } as EntityQueryOptions;
    const waypointNames: string[] = [];
    const entities: Entity[] = [];

    player.dimension.getEntities(options).forEach((entity) => {
      if (entity.id == target.id) {
        return;
      }

      waypointNames.push(entity.nameTag);
      entities.push(entity);
    });

    let form = new WaypointModalForm(waypointNames);

    form.show(player).then(this.handleFormResponse.bind(this, player, entities));
  }

  getEventMap(): Map<string, Function> {
    const eventMap = new Map<string, Function>();
    eventMap.set("playerInteractWithEntity", this.onPlayerInteract);

    return eventMap;
  }

  private handleFormResponse(player: Player, entities: Entity[], formData: any) {
    if (formData.formValues) {
      player.sendMessage("Picked: " + formData.formValues[0]);

      player.teleport(entities[formData.formValues[0]].location);
    }
  }
}
