/* Sport definition: kickboxing. Data and small rule functions only; the planner in src/app reads it through
   sportFor(profile.sport) / planContext(). */
import { RULE_PROFILE } from "./rules.js";
import * as techniques from "./techniques.js";

export const kickboxing = {
  id: "kickboxing",
  visible: true,
  rules: RULE_PROFILE,
  /* Suggested session type per training day (by number of days). The user can change the type of every session. */
  dayPattern: {
    1: ["T"],
    2: ["T", "S"],
    3: ["T", "S", "P"],
    4: ["T", "S", "P", "K"],
    5: ["T", "S", "P", "C", "M"],
    6: ["T", "S", "P", "K", "T", "M"],
    7: ["T", "S", "P", "K", "T", "S", "M"],
  },
  techniques,
};
