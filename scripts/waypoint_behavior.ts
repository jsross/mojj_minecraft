import {
  Player,
  PlayerInteractWithEntityAfterEvent,
  Entity,
  TeleportOptions,
  Vector3,
  EntitySpawnAfterEvent,
  EntityRemoveAfterEvent,
  DataDrivenEntityTriggerBeforeEvent,
  EntityLoadAfterEvent,
  world,
  ChatSendBeforeEvent,
} from "@minecraft/server";
import "./entity_extensions";
import "./player_extensions";

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

    this._waypointRepository.upsertWaypoint(waypoint);
  }

  public onLoaded(event: EntityLoadAfterEvent): void {
    if (event.entity.typeId != "mojj:waypoint") {
      return;
    }

    let entity = event.entity as Entity;

    var waypoint = this.createWaypoint(entity);
    this._waypointRepository.upsertWaypoint(waypoint);
  }

  public onDataDrivenEvent(event: DataDrivenEntityTriggerBeforeEvent): void {
    if (event.id != "mojj:waypoint:on_named") {
      return;
    }

    let entity: Entity = event.entity as Entity;

    var waypoint = this._waypointRepository.getWaypoint(entity.id);

    waypoint.name = entity.nameTag;

    this._waypointRepository.upsertWaypoint(waypoint);
  }

  public onRemoved(event: EntityRemoveAfterEvent): void {
    if (event.typeId != "mojj:waypoint") {
      return;
    }

    this._waypointRepository.removeWaypoint(event.removedEntityId);
  }

  public onPlayerInteract(event: PlayerInteractWithEntityAfterEvent): void {
    const target = event.target;
    const player = event.player;

    if (event.target.typeId != "mojj:waypoint") {
      return;
    }

    if (player.getHeldItem()?.typeId == "minecraft:name_tag") {
      return;
    }

    const waypoints: Waypoint[] = this._waypointRepository
      .getWaypoints()
      .filter((waypoint) => waypoint.id != target.id);

    if (waypoints.length == 0) {
      player.sendMessage("No other waypoints found");

      return;
    }

    let waypointNames = waypoints.map((waypoint) => (waypoint.name ? waypoint.name : "Unnammed"));

    let form = new WaypointModalForm(waypointNames);

    form.show(player).then(this.handleFormResponse.bind(this, player, waypoints));
  }

  // Function to handle chat commands
  public onChat(event: ChatSendBeforeEvent): void {
    console.warn("ChatSendBeforeEvent");

    const player = event.sender as Player;

    if (!player.isOp()) {
      // Check if the player is an admin
      return;
    }

    if (!event.message.startsWith("!wp")) {
      return;
    }

    const messageParts = event.message.split(" "); // Split the message into parts
    const command = messageParts[1]; // Get the command name
    const args = messageParts.slice(2); // Get the arguments

    event.cancel = true; // Cancel the chat event

    switch (command) {
      case "list":
        this.listAllWaypoints(player);
        break;
      case "reset":
        this.resetWaypoints(player);
        break;
      case "remove":
        this.removeWaypoint(player, args);
        // ... handle other commands
        break;
      default:
        player.sendMessage(`Invalid command: ${command}`);

        break;
    }
  }

  removeWaypoint(player: Player, args: string[]) {
    const removed = this._waypointRepository.removeWaypoint(args[0]);

    if (!removed) {
      player.sendMessage("Waypoint not found");
    } else {
      player.sendMessage("Waypoint removed");
    }
  }

  // Function to list all waypoints
  private listAllWaypoints(player: Player): void {
    console.log("Listing all waypoints");

    const waypoints = this._waypointRepository.getWaypoints();

    if (waypoints.length === 0) {
      player.sendMessage("No waypoints available.");
      return;
    }

    const waypointList = waypoints.map((waypoint, index) => `${index}: ${waypoint.id} ${waypoint.name}`).join("\n");

    player.sendMessage(waypointList);
  }

  // Function to reset waypoints
  private resetWaypoints(player: Player): void {
    this._waypointRepository.reset(); // Use the reset method from WaypointRepository
    player.sendMessage("All waypoints have been reset.");
  }

  getAfterEventMap(): Map<string, Function> {
    const eventMap = new Map<string, Function>();

    eventMap.set("playerInteractWithEntity", this.onPlayerInteract);
    eventMap.set("entitySpawn", this.onSpawn);
    eventMap.set("entityRemove", this.onRemoved);
    eventMap.set("dataDrivenEntityTriggerEvent", this.onDataDrivenEvent);
    eventMap.set("entityLoad", this.onLoaded);

    return eventMap;
  }

  getBeforeEventMap(): Map<string, Function> {
    const eventMap = new Map<string, Function>();

    eventMap.set("chatSend", this.onChat);

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
      dimensionId: entity.dimension.id,
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

    let dimension = world.getDimension(waypoint.dimensionId);

    let options = {
      checkForBlocks: true,
      facingLocation: waypoint.facingLocation,
      dimension: dimension,
    } as TeleportOptions;

    let teleportLocation = waypoint.teleportLocation as Vector3;

    player.teleport(teleportLocation, options);
  }
}
