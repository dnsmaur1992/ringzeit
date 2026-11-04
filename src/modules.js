/* Entry of the shared modules. tools/build_pwa.py bundles this file into one script with the global name RZ;
   src/app/00-imports.js takes exactly the names the app uses. Nothing below reads app state or the DOM. */
export * from "./core/index.js";
export { EX, AV } from "./catalog/exercises.js";
export { EX_KEYS, keyOfLegacy, legacyIndex } from "./catalog/ids.js";
export * from "./sports/kickboxing/techniques.js";
export * as BOXT from "./sports/boxing/techniques.js";
export { BOX_TASKS } from "./sports/boxing/tasks.js";
export { dbvClass, dbvFormat, standardFormat as boxStandard, WKB_URL, KO_DAYS as BOX_KO_DAYS } from "./sports/boxing/rules.js";
export { sportFor, visibleSports, previewSports, SPORTS } from "./sports/index.js";
export * as TKDT from "./sports/taekwondo/all.js";
export * as ITFT from "./sports/taekwondo/itf.js";
