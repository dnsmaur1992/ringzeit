/* Sport register. Unfinished sports are added with visible: false and stay out of the normal menu. */
import { kickboxing } from "./kickboxing/index.js";
import { boxing } from "./boxing/index.js";
import { taekwondo } from "./taekwondo/index.js";

export const SPORTS = { kickboxing, boxing, taekwondo };
export const DEFAULT_SPORT = "kickboxing";

/** Sport definition for an id; profiles without a sport (all data so far) are kickboxing. */
export const sportFor = (id) => SPORTS[id] || SPORTS[DEFAULT_SPORT];

/** Sports shown in the normal menu. */
export const visibleSports = () => Object.values(SPORTS).filter((s) => s.visible);

/** Unfinished sports offered as a labelled development preview (per unit only, never in the profile). */
export const previewSports = () => Object.values(SPORTS).filter((s) => !s.visible && s.preview);
