import { world } from "@minecraft/server";
import { Waypoint } from "./waypoint";

export interface IWaypointRepository {
  getWaypoints(): Waypoint[];
  getWaypoint(id: string): Waypoint;
  upsertWaypoint(waypoint: Waypoint): void;
  reset(): void;
  removeWaypoint(id: string): boolean;
}

export class WaypointRepository implements IWaypointRepository {
  private static PROPERTY_KEY: string = "mojj:waypoints";

  private readonly _schemaVersion: string;

  constructor(schemaVersion: string) {
    this._schemaVersion = schemaVersion;
  }

  public getWaypoints(): Waypoint[] {
    var waypointDictionary = this.getWaypointDictionary();

    var results = Object.values(waypointDictionary.waypoints) as Waypoint[];

    return results;
  }

  public getWaypoint(id: string): Waypoint {
    var dictionary = this.getWaypointDictionary();

    var waypoint = dictionary.waypoints[id] as Waypoint;

    return waypoint;
  }

  public upsertWaypoint(waypoint: Waypoint): void {
    var dictionary = this.getWaypointDictionary();

    dictionary.waypoints[waypoint.id] = waypoint;

    this.saveWaypoints(dictionary);
  }

  private saveWaypoints(waypoints: any): void {
    var waypointsString = JSON.stringify(waypoints);

    world.setDynamicProperty(WaypointRepository.PROPERTY_KEY, waypointsString);
  }

  public removeWaypoint(id: string): boolean {
    var waypointDictionary = this.getWaypointDictionary();

    if (waypointDictionary.waypoints[id] == null) {
      return false;
    }

    delete waypointDictionary.waypoints[id];

    this.saveWaypoints(waypointDictionary);

    return true;
  }

  public testRepository(): boolean {
    let result = false;

    try {
      let dictionary: WaypointDictionary = this.getWaypointDictionary();

      if (dictionary.version == this._schemaVersion) {
        result = true;
      }
    } catch (ex) {
      result = false;
    }

    return result;
  }

  private getWaypointDictionary(): WaypointDictionary {
    const waypointsString = world.getDynamicProperty(WaypointRepository.PROPERTY_KEY) as string;
    const dictionary: WaypointDictionary = JSON.parse(waypointsString);

    return dictionary;
  }

  public reset(): void {
    world.setDynamicProperty(
      WaypointRepository.PROPERTY_KEY,
      JSON.stringify({ version: this._schemaVersion, waypoints: {} })
    );
  }
}

interface WaypointDictionary {
  version: string;
  waypoints: { [key: string]: Waypoint };
}
