import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

export class WaypointModalForm extends ModalFormData {
  private readonly _waypoints: string[];

  constructor(waypoints: string[]) {
    super();

    this._waypoints = waypoints;

    this.init();
  }

  private init() {
    this.title("Example Modal Controls for ModalFormData");

    this.dropdown("Waypoints", this._waypoints, 0);
  }
}
