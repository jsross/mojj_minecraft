const gulp = require("gulp");
const ts = require("gulp-typescript");
const del = require("del");
const os = require("os");
const spawn = require("child_process").spawn;
const sourcemaps = require("gulp-sourcemaps");

const PREVIEW_PATH = "/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang";
const DEFAULT_PATH = "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang";

// === CONFIGURABLE VARIABLES

const config = {
  pack_prefix: "the_mojj",
  useMinecraftPreview: false, // Target the "Minecraft Preview" version of Minecraft
  get bpfoldername() {
    return `${this.pack_prefix}_bp`;
  },
  get rpfoldername() {
    return `${this.pack_prefix}_rp`;
  },
  get localAppDataPath() {
    return os.homedir() + (this.useMinecraftPreview ? PREVIEW_PATH : DEFAULT_PATH);
  },
  get devBpFolderPath() {
    return `${this.localAppDataPath}/development_behavior_packs/${this.bpfoldername}`;
  },
  get devRpFolderPath() {
    return `${this.localAppDataPath}/development_resource_packs/${this.rpfoldername}`;
  },
};

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

function clean_local_dev() {
  return clean([config.devBpFolderPath, config.devRpFolderPath], true);
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

function deploy(src, dest) {
  console.log(`Deploying from ${src} to ${dest}`);

  return gulp.src([src + "/**/*"]).pipe(gulp.dest(dest));
}

function deploy_behavior_pack_to_localmc_dev() {
  return deploy(`build/behavior_packs/${config.bpfoldername}`, config.devBpFolderPath);
}

function deploy_resource_pack_to_localmc_dev() {
  return deploy(`build/resource_packs/${config.rpfoldername}`, config.devRpFolderPath);
}

const deploy_local_dev = gulp.series(
  clean_local_dev,
  gulp.parallel(deploy_behavior_pack_to_localmc_dev, deploy_resource_pack_to_localmc_dev)
);

function watch() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(build, deploy_local_dev)
  );
}

exports.build = build;
exports.deploy_local_dev = deploy_local_dev;
exports.default = gulp.series(build, deploy_local_dev);
exports.clean = gulp.series(clean_build, clean_local_dev);
exports.watch = gulp.series(build, deploy_local_dev, watch);
