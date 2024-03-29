import { Vector3 } from "@minecraft/server";

export interface Waypoint {
  id: string;
  name: string;
  dimensionId: string;
  wayPointLocation: Vector3;
  teleportLocation: Vector3;
  facingLocation: Vector3;
}
