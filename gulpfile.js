const gulp = require("gulp");
const ts = require("gulp-typescript");
const del = require("del");
const os = require("os");
const spawn = require("child_process").spawn;
const sourcemaps = require("gulp-sourcemaps");

const PREVIEW_PATH =
  "/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang";
const DEFAULT_PATH = "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang";

// === CONFIGURABLE VARIABLES

// Initial properties
const config = {
  pack_prefix: "the_mojj",
  useMinecraftPreview: false, // Target the "Minecraft Preview" version of Minecraft
};

// Add dependent properties
config.bpfoldername = `${config.pack_prefix}_bp`;
config.rpfoldername = `${config.pack_prefix}_rp`;
config.localStatePath = config.useMinecraftPreview ? PREVIEW_PATH : DEFAULT_PATH;
config.mcdir = os.homedir() + config.localStatePath;
config.devBpFolderPath = `${config.mcdir}/development_behavior_packs/${config.bpfoldername}`;
config.devRpFolderPath = `${config.mcdir}/development_resource_packs/${config.rpfoldername}`;

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

function deploy_localmc_behavior_packs() {
  return deploy(`build/behavior_packs/${config.bpfoldername}`, config.devBpFolderPath);
}

function deploy_localmc_resource_packs() {
  return deploy("build/resource_packs/" + config.rpfoldername, config.devRpFolderPath);
}

const deploy_localmc = gulp.series(
  clean_localmc,
  gulp.parallel(deploy_localmc_behavior_packs, deploy_localmc_resource_packs)
);

function watch() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(build, deploy_localmc)
  );
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
