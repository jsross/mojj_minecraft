import { ModalFormData } from "@minecraft/server-ui";

export class WaypointModalForm extends ModalFormData {
  private readonly _waypoints: string[];

  constructor(waypoints: string[]) {
    super();

    this._waypoints = waypoints;

    this.init();
  }

  private init() {
    this.title("Select a waypoint:");
    this.dropdown("Waypoints", this._waypoints, 0);
  }
}
