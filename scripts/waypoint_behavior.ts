import {
  Player,
  PlayerInteractWithEntityAfterEvent,
  EntityQueryOptions,
  Entity,
  TeleportOptions,
  Vector3,
  world,
  EntitySpawnAfterEvent,
  EntityRemoveAfterEvent,
} from "@minecraft/server";
import "./entity_extensions";

import { Behavior } from "./behavior";
import { WaypointModalForm } from "./waypoint_modal_form";
import { Waypoint } from "./waypoint";
import { IWaypointRepository } from "./waypoint_repository";

export class WaypointBehavior extends Behavior {
  private readonly _waypointRepository: IWaypointRepository;

  constructor(waypointRepository: IWaypointRepository) {
    super();

    this._waypointRepository = waypointRepository;
  }

  public onSpawn(event: EntitySpawnAfterEvent): void {
    if (event.entity.typeId != "mojj:waypoint") {
      return;
    }

    let entity = event.entity as Entity;

    let waypoint = this.createWaypoint(entity);

    this._waypointRepository.addWaypoint(waypoint);
  }

  public onRemoved(event: EntityRemoveAfterEvent): void {
    if (event.typeId != "mojj:waypoint") {
      return;
    }

    console.warn("onRemoved");

    this._waypointRepository.removeWaypoint(event.removedEntityId);
  }

  public onPlayerInteract(event: PlayerInteractWithEntityAfterEvent): void {
    if (event.target.typeId != "mojj:waypoint") {
      return;
    }

    const player = event.player;

    const waypoints: Waypoint[] = this._waypointRepository.getWaypoints();

    if (waypoints.length == 0) {
      player.sendMessage("No other waypoints found");

      return;
    }

    console.warn("Waypoint: " + JSON.stringify(waypoints[0]));
    console.warn("ID: " + waypoints[0].id);

    let waypointNames = waypoints.map((waypoint) => (waypoint.name ? waypoint.name : "Unnammed"));

    let form = new WaypointModalForm(waypointNames);

    form.show(player).then(this.handleFormResponse.bind(this, player, waypoints));
  }

  getEventMap(): Map<string, Function> {
    const eventMap = new Map<string, Function>();
    eventMap.set("playerInteractWithEntity", this.onPlayerInteract);
    eventMap.set("entitySpawn", this.onSpawn);
    eventMap.set("entityRemove", this.onRemoved);

    return eventMap;
  }

  private createWaypoint(entity: Entity): Waypoint {
    let teleportLocation: Vector3;
    let facingLocation: Vector3;
    let entityLocation = {
      x: Math.floor(entity.location.x),
      y: Math.floor(entity.location.y),
      z: Math.floor(entity.location.z),
    } as Vector3;

    switch (entity.getCardinalDirection()) {
      case "North":
        teleportLocation = { x: entityLocation.x, y: entityLocation.y, z: entityLocation.z - 1 } as Vector3;
        facingLocation = { x: entityLocation.x, y: entityLocation.y, z: entityLocation.z - 2 } as Vector3;

        break;
      case "South":
        teleportLocation = { x: entityLocation.x, y: entityLocation.y, z: entityLocation.z + 1 } as Vector3;
        facingLocation = { x: entityLocation.x, y: entityLocation.y, z: entityLocation.z + 2 } as Vector3;

        break;
      case "East":
        teleportLocation = { x: entityLocation.x + 1, y: entityLocation.y, z: entityLocation.z } as Vector3;
        facingLocation = { x: entityLocation.x + 2, y: entityLocation.y, z: entityLocation.z } as Vector3;

        break;
      case "West":
        teleportLocation = { x: entityLocation.x - 1, y: entityLocation.y, z: entityLocation.z } as Vector3;
        facingLocation = { x: entityLocation.x - 2, y: entityLocation.y, z: entityLocation.z } as Vector3;

        break;
      default:
        throw "Invalid cardinal direction";

        break;
    }

    let waypoint = {
      id: entity.id,
      name: entity.nameTag,
      wayPointLocation: entityLocation,
      teleportLocation: teleportLocation,
      facingLocation: facingLocation,
    } as Waypoint;

    return waypoint;
  }

  private handleFormResponse(player: Player, waypoints: Waypoint[], formData: any) {
    if (!formData.formValues) {
      return;
    }

    let index = parseInt(formData.formValues[0]);

    let waypoint = waypoints[index] as Waypoint;

    console.warn("Waypoint:" + JSON.stringify(waypoint));

    let options = { checkForBlocks: true, facingLocation: waypoint.facingLocation } as TeleportOptions;

    console.warn("TP o:" + waypoint.teleportLocation);
    console.warn("TP os:" + JSON.stringify(waypoint.teleportLocation));

    let teleportLocation = waypoint.teleportLocation as Vector3;

    console.warn("TP:" + JSON.stringify(teleportLocation));

    player.teleport(teleportLocation);
  }
}
