import { world, system, BlockLocation, MinecraftBlockTypes, Dimension } from "@minecraft/server";
import Utilities from "./Utilities.js";

const START_TICK = 100;
const ARENA_X_SIZE = 30;
const ARENA_Z_SIZE = 30;
const ARENA_X_OFFSET = 0;
const ARENA_Y_OFFSET = -60;
const ARENA_Z_OFFSET = 0;

// global variables

export default class BreakTheTerracotta {
  private curTick: number = 0;
  private score = 0;
  private cottaX = 0;
  private cottaZ = 0;
  private spawnCountdown = 1;

  private dimension: Dimension;

  public constructor() {
    this.dimension = world.getDimension("overworld");
  }

  public initialize() {
    // catch in case we've already added this score before.
    try {
      this.dimension.runCommandAsync('scoreboard objectives add score dummy "Level"');
    } catch (e) {}

    // eliminate pesky nearby mobs
    try {
      this.dimension.runCommandAsync("kill @e[type=!player]");
    } catch (e) {}

    this.dimension.runCommandAsync("scoreboard objectives setdisplay sidebar score");

    this.dimension.runCommandAsync("give @p diamond_sword");
    this.dimension.runCommandAsync("give @p dirt 64");

    this.dimension.runCommandAsync("scoreboard players set @p score 0");

    world.say("BREAK THE TERRACOTTA");

    Utilities.fillBlock(
      MinecraftBlockTypes.air,
      ARENA_X_OFFSET - ARENA_X_SIZE / 2 + 1,
      ARENA_Y_OFFSET,
      ARENA_Z_OFFSET - ARENA_Z_SIZE / 2 + 1,
      ARENA_X_OFFSET + ARENA_X_SIZE / 2 - 1,
      ARENA_Y_OFFSET + 10,
      ARENA_Z_OFFSET + ARENA_Z_SIZE / 2 - 1
    );

    Utilities.fourWalls(
      MinecraftBlockTypes.cobblestone,
      ARENA_X_OFFSET - ARENA_X_SIZE / 2,
      ARENA_Y_OFFSET,
      ARENA_Z_OFFSET - ARENA_Z_SIZE / 2,
      ARENA_X_OFFSET + ARENA_X_SIZE / 2,
      ARENA_Y_OFFSET + 10,
      ARENA_Z_OFFSET + ARENA_Z_SIZE / 2
    );

    this.dimension.runCommandAsync(
      "tp @p " + String(ARENA_X_OFFSET - 3) + " " + ARENA_Y_OFFSET + " " + String(ARENA_Z_OFFSET - 3)
    );
  }

  public tick() {
    try {
      if (this.curTick === START_TICK) {
        this.initialize();
      }

      this.curTick++;

      if (this.curTick > START_TICK && this.curTick % 20 === 0) {
        // no terracotta exists, and we're waiting to spawn a new one.
        if (this.spawnCountdown > 0) {
          this.spawnCountdown--;

          if (this.spawnCountdown <= 0) {
            this.spawnNewTerracotta();
          }
        } else {
          this.checkForTerracotta();
        }
      }

      let spawnInterval = Math.ceil(200 / ((this.score + 1) / 3));

      if (this.curTick > START_TICK && this.curTick % spawnInterval === 0) {
        this.spawnMobs();
      }

      if (this.curTick > START_TICK && this.curTick % 29 === 0) {
        this.addFuzzyLeaves();
      }
    } catch (e) {
      console.warn("Tick error: " + e);
    }
  }

  private spawnNewTerracotta() {
    // create new terracotta
    this.cottaX = Math.floor(Math.random() * (ARENA_X_SIZE - 1)) - (ARENA_X_SIZE / 2 - 1);
    this.cottaZ = Math.floor(Math.random() * (ARENA_Z_SIZE - 1)) - (ARENA_Z_SIZE / 2 - 1);

    world.say("Creating new terracotta!");

    this.dimension
      .getBlock(new BlockLocation(this.cottaX + ARENA_X_OFFSET, 1 + ARENA_Y_OFFSET, this.cottaZ + ARENA_Z_OFFSET))
      .setType(MinecraftBlockTypes.yellowGlazedTerracotta);
  }

  private checkForTerracotta() {
    let block = this.dimension.getBlock(
      new BlockLocation(this.cottaX + ARENA_X_OFFSET, 1 + ARENA_Y_OFFSET, this.cottaZ + ARENA_Z_OFFSET)
    );

    if (block.type !== MinecraftBlockTypes.yellowGlazedTerracotta) {
      // we didn't find the terracotta! set a new spawn countdown
      this.score++;
      this.spawnCountdown = 2;
      this.cottaX = -1;
      this.dimension.runCommandAsync("scoreboard players set @p score " + this.score);
      world.say("You broke the terracotta! Creating new terracotta in a few seconds.");
      this.cottaZ = -1;
    }
  }

  private spawnMobs() {
    // spawn mobs = create 1-2 mobs
    let spawnMobCount = Math.floor(Math.random() * 2) + 1;

    for (let j = 0; j < spawnMobCount; j++) {
      let zombieX = Math.floor(Math.random() * (ARENA_X_SIZE - 2)) - ARENA_X_SIZE / 2;
      let zombieZ = Math.floor(Math.random() * (ARENA_Z_SIZE - 2)) - ARENA_Z_SIZE / 2;

      this.dimension.spawnEntity(
        "minecraft:zombie",
        new BlockLocation(zombieX + ARENA_X_OFFSET, 1 + ARENA_Y_OFFSET, zombieZ + ARENA_Z_OFFSET)
      );
    }
  }

  private addFuzzyLeaves() {
    for (let i = 0; i < 10; i++) {
      const leafX = Math.floor(Math.random() * (ARENA_X_SIZE - 1)) - (ARENA_X_SIZE / 2 - 1);
      const leafY = Math.floor(Math.random() * 10);
      const leafZ = Math.floor(Math.random() * (ARENA_Z_SIZE - 1)) - (ARENA_Z_SIZE / 2 - 1);

      this.dimension
        .getBlock(new BlockLocation(leafX + ARENA_X_OFFSET, leafY + ARENA_Y_OFFSET, leafZ + ARENA_Z_OFFSET))
        .setType(MinecraftBlockTypes.leaves);
    }
  }
}
