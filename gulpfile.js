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
  get localDevBpFolder() {
    return `${this.localAppDataPath}/development_behavior_packs/${this.bpfoldername}`;
  },
  get localDevRpFolder() {
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

function deploy(src, dest) {
  console.log(`Deploying from ${src} to ${dest}`);

  return gulp.src([src + "/**/*"]).pipe(gulp.dest(dest));
}

function clean_bp_build_folder() {
  return clean(["build/behavior_packs/"]);
}

function clean_rp_build_folder() {
  return clean(["build/resource_packs/"]);
}

function clean_bp_deploy_folder() {
  return clean([config.localDevBpFolder], true);
}

function clean_rp_deploy_folder() {
  return clean([config.localDevRpFolder], true);
}

function copy_behavior_packs() {
  return gulp.src(["behavior_packs/**/*"]).pipe(gulp.dest("build/behavior_packs"));
}

function build_resource_pack() {
  return gulp.src(["resource_packs/**/*"]).pipe(gulp.dest("build/resource_packs"));
}

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

function deploy_behavior_pack_to_localmc_dev() {
  return deploy(`build/behavior_packs/${config.bpfoldername}`, config.localDevBpFolder);
}

function deploy_resource_pack_to_localmc_dev() {
  return deploy(`build/resource_packs/${config.rpfoldername}`, config.localDevRpFolder);
}

function watch() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(exports.build_all, exports.deploy_all_to_dev)
  );
}

exports.build_bp = gulp.series(clean_bp_build_folder, copy_behavior_packs, compile_scripts);
exports.build_rp = gulp.series(clean_rp_build_folder, build_resource_pack);
exports.build_all = gulp.parallel(exports.build_bp, exports.build_rp);

exports.deploy_bp_to_dev = gulp.series(clean_bp_deploy_folder, deploy_behavior_pack_to_localmc_dev);
exports.deploy_rp_to_dev = gulp.series(clean_rp_deploy_folder, deploy_resource_pack_to_localmc_dev);
exports.deploy_all_to_dev = gulp.parallel(exports.deploy_bp_to_dev, exports.deploy_rp_to_dev);

exports.default = gulp.series(exports.build_all, exports.deploy_all_to_dev);
exports.clean_all = gulp.parallel(
  clean_bp_build_folder,
  clean_rp_build_folder,
  clean_bp_deploy_folder,
  clean_rp_deploy_folder
);
exports.watch = gulp.series(exports.default, watch);
