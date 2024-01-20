const gulp = require("gulp");
const ts = require("gulp-typescript");
const del = require("del");
const os = require("os");
const spawn = require("child_process").spawn;
const sourcemaps = require("gulp-sourcemaps");

const PREVIEW_PATH =
  "/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang/";
const DEFAULT_PATH = "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/";

let activeServer = null;

// === CONFIGURABLE VARIABLES

// Initial properties
const config = {
  pack_prefix: "the_mojj",
  useMinecraftPreview: false, // Target the "Minecraft Preview" version of Minecraft
  useMinecraftDedicatedServer: false, // Use Bedrock Dedicated Server
  dedicatedServerPath: "C:/mc/bds/1.19.0/", // Path to Bedrock Dedicated Server package
};

// Add dependent properties
config.bpfoldername = `${config.pack_prefix}_bp`;
config.rpfoldername = `${config.pack_prefix}_rp`;
config.worldsFolderName = config.useMinecraftDedicatedServer ? "worlds" : "minecraftWorlds";
config.localStatePath = config.useMinecraftPreview ? PREVIEW_PATH : DEFAULT_PATH;
config.activeWorldFolderName = config.useMinecraftDedicatedServer ? "Bedrock level" : `${config.bpfoldername}world`;
config.mcdir = config.useMinecraftDedicatedServer ? config.dedicatedServerPath : os.homedir() + config.localStatePath;
config.targetWorldPath = `${config.mcdir}${config.worldsFolderName}/${config.activeWorldFolderName}`;
config.targetConfigPath = `${config.mcdir}config`;
config.targetWorldBackupPath = `backups/worlds/${config.activeWorldFolderName}`;
config.devConfigPath = "config";
config.devWorldPath = "worlds/default";
config.devWorldBackupPath = "backups/worlds/devdefault";
config.devBpFolderPath = `${config.mcdir}development_behavior_packs/${config.bpfoldername}`;
config.devRpFolderPath = `${config.mcdir}development_resource_packs/${config.rpfoldername}`;

// === END CONFIGURABLE VARIABLES

// === Clean
function clean(paths, force = false) {
  var promise = new Promise(function (resolve, reject) {
    console.log("Cleaning:", paths);

    del(paths, { force }).then(
      () => {
        console.log("Clean successful:", paths);

        resolve();
      },
      (error) => {
        console.error("Clean failed:", paths, error);

        reject();
      }
    );
  });

  return promise;
}

function clean_build() {
  return clean(["build/behavior_packs/", "build/resource_packs/"]);
}

function clean_localmc() {
  return clean([config.devBpFolderPath, config.devRpFolderPath], true);
}

function clean_localmc_world() {
  return clean([config.targetWorldPath], true);
}

function clean_localmc_config() {
  return clean([config.targetConfigPath], true);
}

function clean_dev_world() {
  clean([config.devWorldPath], true);
}

function clean_localmc_world_backup() {
  clean([config.targetWorldBackupPath], true);
}

function clean_dev_world_backup() {
  clean([config.devWorldBackupPath], true);
}

function copy_behavior_packs() {
  return gulp.src(["behavior_packs/**/*"]).pipe(gulp.dest("build/behavior_packs"));
}

function copy_resource_packs() {
  return gulp.src(["resource_packs/**/*"]).pipe(gulp.dest("build/resource_packs"));
}

const copy_content = gulp.parallel(copy_behavior_packs, copy_resource_packs);

function compile_scripts() {
  return gulp
    .src("scripts/**/*.ts")
    .pipe(sourcemaps.init())
    .pipe(
      ts({
        module: "es2020",
        moduleResolution: "node",
        lib: ["es2020", "dom"],
        strict: true,
        target: "es2020",
        noImplicitAny: true,
      })
    )
    .pipe(
      sourcemaps.write("../../_" + config.bpfoldername + "Debug", {
        destPath: config.bpfoldername + "/scripts/",
        sourceRoot: "./../../../scripts/",
      })
    )
    .pipe(gulp.dest("build/behavior_packs/" + config.bpfoldername + "/scripts"));
}

const build = gulp.series(clean_build, copy_content, compile_scripts);

function deploy_localmc_behavior_packs() {
  console.log(`Deploying to ${config.devBpFolderPath}`);

  return gulp.src(["build/behavior_packs/" + config.bpfoldername + "/**/*"]).pipe(gulp.dest(config.devBpFolderPath));
}

function deploy_localmc_resource_packs() {
  return gulp.src(["build/resource_packs/" + config.rpfoldername + "/**/*"]).pipe(gulp.dest(config.devRpFolderPath));
}

function backup_dev_world() {
  console.log("Copying world '" + config.devWorldPath + "' to '" + config.devWorldBackupPath + "'");
  return gulp
    .src([config.targetWorldPath + "/**/*"])
    .pipe(gulp.dest(config.devWorldBackupPath + "/worlds/" + config.activeWorldFolderName));
}

function deploy_localmc_config() {
  console.log("Copying world 'config/' to '" + config.targetConfigPath + "'");
  return gulp.src([config.devConfigPath + "/**/*"]).pipe(gulp.dest(config.targetConfigPath));
}

function deploy_localmc_world() {
  console.log("Copying world 'worlds/default/' to '" + config.targetWorldPath + "'");
  return gulp.src([config.devWorldPath + "/**/*"]).pipe(gulp.dest(config.targetWorldPath));
}

function ingest_localmc_world() {
  console.log("Ingesting world '" + config.targetWorldPath + "' to '" + config.devWorldPath + "'");
  return gulp.src([config.targetWorldPath + "/**/*"]).pipe(gulp.dest(config.devWorldPath));
}

function backup_localmc_world() {
  console.log("Copying world '" + config.targetWorldPath + "' to '" + config.targetWorldBackupPath + "/'");
  return gulp
    .src([config.targetWorldPath + "/**/*"])
    .pipe(gulp.dest(config.targetWorldBackupPath + "/" + config.activeWorldFolderName));
}

const deploy_localmc = gulp.series(
  clean_localmc,
  function (callbackFunction) {
    if (!config.useMinecraftDedicatedServer) {
      console.log("\007"); // annunciate a beep!
    }
    callbackFunction();
  },
  gulp.parallel(deploy_localmc_behavior_packs, deploy_localmc_resource_packs)
);

function watch() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(build, deploy_localmc)
  );
}

function serve() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(stopServer, build, deploy_localmc, startServer)
  );
}

function startServer(callbackFunction) {
  if (activeServer) {
    activeServer.stdin.write("stop\n");
    activeServer = null;
  }

  activeServer = spawn(config.dedicatedServerPath + "bedrock_server");

  let logBuffer = "";

  let serverLogger = function (buffer) {
    let incomingBuffer = buffer.toString();

    if (incomingBuffer.endsWith("\n")) {
      (logBuffer + incomingBuffer).split(/\n/).forEach(function (message) {
        if (message) {
          if (message.indexOf("Server started.") >= 0) {
            activeServer.stdin.write("script debugger listen 19144\n");
            console.log("\007"); // annunciate a beep!
          }
          console.log("Server: " + message);
        }
      });
      logBuffer = "";
    } else {
      logBuffer += incomingBuffer;
    }
  };

  activeServer.stdout.on("data", serverLogger);
  activeServer.stderr.on("data", serverLogger);

  callbackFunction();
}

function stopServer(callbackFunction) {
  if (activeServer) {
    activeServer.stdin.write("stop\n");
    activeServer = null;
  }

  callbackFunction();
}

exports.clean_build = clean_build;
exports.copy_behavior_packs = copy_behavior_packs;
exports.copy_resource_packs = copy_resource_packs;
exports.compile_scripts = compile_scripts;
exports.copy_content = copy_content;
exports.build = build;
exports.clean_localmc = clean_localmc;
exports.deploy_localmc = deploy_localmc;
exports.default = gulp.series(build, deploy_localmc);
exports.clean = gulp.series(clean_build, clean_localmc);
exports.watch = gulp.series(build, deploy_localmc, watch);
exports.serve = gulp.series(build, deploy_localmc, startServer, serve);
exports.updateworld = gulp.series(
  clean_localmc_world_backup,
  backup_localmc_world,
  clean_localmc_world,
  deploy_localmc_world
);
exports.ingestworld = gulp.series(clean_dev_world_backup, backup_dev_world, clean_dev_world, ingest_localmc_world);
exports.updateconfig = gulp.series(clean_localmc_config, deploy_localmc_config);
