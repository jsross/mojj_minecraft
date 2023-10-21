import { Vector3 } from "@minecraft/server";

export class Rectangle {
  private readonly _lowNw: Vector3;
  private readonly _upSe: Vector3;

  constructor(lowNw: Vector3, upSe: Vector3) {
    this._lowNw = lowNw;
    this._upSe = upSe;
  }

  public getLowerNwCoordinates(): Vector3 {
    return this._lowNw;
  }

  public getUpperSeCoordinates(): Vector3 {
    return this._upSe;
  }
}
