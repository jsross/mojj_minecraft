import { Vector3, world } from "@minecraft/server";
import { Waypoint } from "./waypoint";

export interface IWaypointRepository {
  getWaypoints(): Waypoint[];
  addWaypoint(waypoint: Waypoint): void;
  removeWaypoint(id: string): void;
}

export class WaypointRepository implements IWaypointRepository {
  private static PROPERTY_KEY: string = "mojj:waypoints";

  constructor() {}

  public getWaypoints(): Waypoint[] {
    var waypointDictionary = this.getWaypointDictionary();

    var results = Object.values(waypointDictionary) as Waypoint[];

    return results;
  }

  public addWaypoint(waypoint: Waypoint): void {
    var waypointDictionary = this.getWaypointDictionary();

    waypointDictionary[waypoint.id] = waypoint;

    this.saveWaypoints(waypointDictionary);
  }

  private saveWaypoints(waypoints: any): void {
    var waypointsString = JSON.stringify(waypoints);

    world.setDynamicProperty(WaypointRepository.PROPERTY_KEY, waypointsString);
  }

  public removeWaypoint(id: string): void {
    var waypointDictionary = this.getWaypointDictionary();

    delete waypointDictionary[id];

    this.saveWaypoints(waypointDictionary);
  }

  public testRepository(): boolean {
    let result = false;

    try {
      this.getWaypoints();

      result = true;
    } catch (ex) {
      result = false;
    }

    return result;
  }

  private getWaypointDictionary(): any {
    let results = {} as any;

    var waypointsString = world.getDynamicProperty(WaypointRepository.PROPERTY_KEY) as string;
    var waypoints = JSON.parse(waypointsString);

    for (const property in waypoints) {
      let waypointObject: any = waypoints[property] as Waypoint;

      results[property] = waypointObject;

      //console.warn(JSON.stringify(waypoint.teleportLocation))
    }

    return waypoints;
  }

  public reset(): void {
    world.setDynamicProperty(WaypointRepository.PROPERTY_KEY, JSON.stringify({}));
  }
}
