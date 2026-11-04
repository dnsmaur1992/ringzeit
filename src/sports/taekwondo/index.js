/* Sport definition: taekwondo (styles WT and ITF-D). 6a: grade area and dobok figures. 6b: WT plans (techniques,
   combos, counters, partner tasks, rule profile). 6c: ITF-D plans (itf.js: hand-foot technique, Matsogi drills, own
   names), see docs/taekwondo-concept.md. */
import * as grades from "./grades.js";
import * as techniques from "./techniques.js";
import { wtFormat, itfFormat, STD_FORMAT, koDaysFor } from "./rules.js";

export const RULE_PROFILE = {
  publisher: "WT / DTU",
  title: "World Taekwondo Competition Rules · DTU Wettkampfordnung Zweikampf (WOZ)",
  version: "WT ab 01.06.2026 · WOZ Stand 01.01.2026",
  url: "https://www.dtu.de/",
  disciplines: [],
  /* the style (WT or ITF-D) is passed as the first argument */
  format: (style, age) => (style === "itf" ? itfFormat(style, age) : wtFormat(style, age)),
  standardFormat: STD_FORMAT,
  koDays: koDaysFor, // by age (WOZ 17.3)
};

export const taekwondo = {
  id: "taekwondo",
  visible: true,
  rules: RULE_PROFILE,
  /* technique first like boxing; from 5 days a different mix (docs/taekwondo-concept.md 6.2) */
  dayPattern: {
    1: ["T"],
    2: ["T", "S"],
    3: ["T", "S", "P"],
    4: ["T", "S", "P", "K"],
    5: ["T", "S", "P", "C", "K"],
    6: ["T", "S", "P", "K", "T", "M"],
    7: ["T", "S", "P", "K", "C", "S", "M"],
  },
  /* WT (7b, docs/taekwondo-concept.md 6.2, F1 = yes): from 4 days one mobility unit instead of conditioning */
  dayPatternWt: {
    1: ["T"],
    2: ["T", "S"],
    3: ["T", "S", "P"],
    4: ["T", "S", "P", "M"],
    5: ["T", "S", "P", "C", "M"],
    6: ["T", "S", "P", "M", "T", "M"],
    7: ["T", "S", "P", "M", "T", "S", "M"],
  },
  techniques,
  grades,
};
