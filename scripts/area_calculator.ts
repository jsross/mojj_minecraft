import { Block, Direction, Vector3 } from "@minecraft/server";
import { Rectangle } from "./rectangle";

export interface IAreaCalculator {
  calculateAreaForBlock(
    origin: Block,
    face: Direction,
    width: any,
    height: any,
    length: any,
    playerFacing: Direction
  ): Rectangle;
}

export class AreaCalculator implements IAreaCalculator {
  public calculateAreaForBlock(
    origin: Block,
    face: Direction,
    width: any,
    height: any,
    length: any,
    playerFacing: Direction
  ): Rectangle {
    let lowNw: Vector3 = this.getLowerNorthWestBlockLocation(origin, width, height, length, face, playerFacing);

    let upSe: Vector3 = this.getUpperSouthEastBlockLocation(origin, width, height, length, face, playerFacing);

    let rectangle = new Rectangle(lowNw, upSe);

    return rectangle;
  }

  private getUpperSouthEastBlockLocation(
    origin: Vector3,
    width: number,
    height: number,
    length: number,
    face: Direction,
    playerFacing: Direction
  ): Vector3 {
    let upSe: Vector3;

    switch (face) {
      case Direction.North:
        upSe = {
          x: origin.x + Math.floor(width / 2),
          y: origin.y + Math.floor(height / 2),
          z: origin.z + (length - 1),
        };
        break;
      case Direction.South:
        upSe = {
          x: origin.x + Math.floor(width / 2),
          y: origin.y + Math.floor(height / 2),
          z: origin.z,
        };
        break;
      case Direction.East:
        upSe = {
          x: origin.x,
          y: origin.y + Math.floor(height / 2),
          z: origin.z + Math.floor(width / 2),
        };

        break;
      case Direction.West:
        upSe = {
          x: origin.x + (length - 1),
          y: origin.y + Math.floor(height / 2),
          z: origin.z + Math.floor(width / 2),
        };
        break;
      case Direction.Down:
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          upSe = {
            x: origin.x + Math.floor(height / 2),
            y: origin.y,
            z: origin.z + Math.floor(width / 2),
          };
        } else {
          // North or South
          upSe = {
            x: origin.x + Math.floor(width / 2),
            y: origin.y,
            z: origin.z + Math.floor(height / 2),
          };
        }

        break;
      case Direction.Up:
        // Determine which quadrant or side of the block the player is standing on
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          upSe = {
            x: origin.x + Math.floor(height / 2),
            y: origin.y,
            z: origin.z + Math.floor(width / 2),
          };
        } else {
          // North or South
          upSe = {
            x: origin.x + Math.floor(width / 2),
            y: origin.y,
            z: origin.z + Math.floor(height / 2),
          };
        }
        break;

      default:
        throw new Error("Invalid direction provided.");
    }

    return upSe;
  }

  private getLowerNorthWestBlockLocation(
    origin: Vector3,
    width: number,
    height: number,
    length: number,
    face: Direction,
    playerFacing: Direction
  ): Vector3 {
    let loNw: Vector3;

    switch (face) {
      case Direction.North:
        loNw = {
          x: origin.x - Math.floor(width / 2),
          y: origin.y - Math.floor(height / 2),
          z: origin.z,
        };
        break;
      case Direction.South:
        loNw = {
          x: origin.x - Math.floor(width / 2),
          y: origin.y - Math.floor(height / 2),
          z: origin.z - (length - 1),
        };
        break;
      case Direction.East:
        loNw = {
          x: origin.x - (length - 1),
          y: origin.y - Math.floor(height / 2),
          z: origin.z - Math.floor(width / 2),
        };

        break;
      case Direction.West:
        loNw = {
          x: origin.x,
          y: origin.y - Math.floor(height / 2),
          z: origin.z - Math.floor(width / 2),
        };
        break;
      case Direction.Down:
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          loNw = {
            x: origin.x - Math.floor(height / 2),
            y: origin.y + (length - 1),
            z: origin.z - Math.floor(width / 2),
          };
        } else {
          // North or South
          loNw = {
            x: origin.x - Math.floor(width / 2),
            y: origin.y + (length - 1),
            z: origin.z - Math.floor(height / 2),
          };
        }

        break;
      case Direction.Up:
        if (playerFacing == Direction.East || playerFacing == Direction.West) {
          // East or West
          loNw = {
            x: origin.x - Math.floor(height / 2),
            y: origin.y - (length - 1),
            z: origin.z - Math.floor(width / 2),
          };
        } else {
          // North or South
          loNw = {
            x: origin.x - Math.floor(width / 2),
            y: origin.y - (length - 1),
            z: origin.z - Math.floor(height / 2),
          };
        }
        break;

      default:
        throw new Error("Invalid direction provided.");
    }

    return loNw;
  }
}
