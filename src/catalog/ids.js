/* Stable exercise ids (step 3-D). The position in this list is the OLD numeric id (legacy index): data saved before
   3-D stores that number and is converted when it is loaded. NEVER reorder, remove or rename an entry; new exercises are
   appended at the end. Display names (de/en, later Korean romanisation) live in exercises.js and may change freely –
   doses, sketches, tips and selection rules refer to these ids only. */
export const EX_KEYS = [
  "warm.easy_jump_rope", // 0
  "warm.easy_jog", // 1
  "warm.joint_mobility", // 2
  "warm.footwork_drill", // 3
  "warm.dynamic_stretching", // 4
  "warm.easy_shadowboxing", // 5
  "warm.band_activation", // 6
  "cond.rope_intervals", // 7
  "cond.burpees", // 8
  "cond.mountain_climbers", // 9
  "cond.sprints", // 10
  "cond.hill_sprints", // 11
  "cond.shadow_sprints", // 12
  "cond.bag_sprints", // 13
  "cond.band_punches", // 14
  "cond.kettlebell_swings", // 15
  "cond.kick_intervals", // 16
  "cond.strides", // 17
  "cond.skater_jumps", // 18
  "cond.bear_crawl", // 19
  "cond.stair_or_bench_runs", // 20
  "cond.stepping_and_light_footwork", // 21
  "str.push_ups", // 22
  "str.plank", // 23
  "str.pull_ups", // 24
  "str.negative_pull_ups", // 25
  "str.hanging_knee_raises", // 26
  "str.dead_hang", // 27
  "str.barbell_back_squat", // 28
  "str.barbell_romanian_deadlift", // 29
  "str.bench_press", // 30
  "str.lat_pulldown", // 31
  "str.seated_cable_row", // 32
  "str.leg_press", // 33
  "str.cable_woodchop", // 34
  "str.seated_dumbbell_shoulder_press", // 35
  "str.cable_face_pulls", // 36
  "str.barbell_hip_thrust", // 37
  "cond.rowing_machine_intervals", // 38
  "cond.treadmill_intervals", // 39
  "cond.bike_sprints", // 40
  "str.dead_bugs", // 41
  "str.russian_twists", // 42
  "str.lunges", // 43
  "str.goblet_squats", // 44
  "str.band_rows", // 45
  "str.dumbbell_press", // 46
  "str.glute_bridges", // 47
  "str.single_leg_kick_hold", // 48
  "str.pallof_press", // 49
  "str.hollow_hold", // 50
  "str.step_ups", // 51
  "str.neck_iso_hold", // 52
  "str.romanian_deadlift", // 53
  "str.bulgarian_split_squats", // 54
  "str.copenhagen_plank", // 55
  "str.single_leg_calf_raises", // 56
  "str.band_face_pulls", // 57
  "str.plank_shoulder_taps", // 58
  "mob.quadruped_hip_circles", // 59
  "mob.90_90_hip_switches", // 60
  "mob.cossack_squats", // 61
  "mob.worlds_greatest_stretch", // 62
  "mob.open_book_rotation", // 63
  "mob.knee_to_wall_ankle", // 64
  "mob.band_dislocates", // 65
  "mob.frog_stretch", // 66
  "mob.pigeon_stretch", // 67
  "mob.cat_cow", // 68
  "mob.slow_motion_kicks", // 69
  "mob.deep_squat_hold", // 70
  "mob.neck_mobility", // 71
  "cool.hip_flexor_stretch", // 72
  "cool.adductors_and_splits", // 73
  "cool.hamstrings", // 74
  "cool.shoulder_and_chest", // 75
  "cool.breathing", // 76
  "cool.easy_cool_down_jog", // 77
  "pow.jump_squats", // 78
  "pow.broad_jumps", // 79
  "pow.lateral_bounds", // 80
  "pow.clap_push_ups", // 81
  "pow.explosive_push_ups", // 82
  "cond.speed_rounds", // 83
  "mob.controlled_leg_swings", // 84
  "mob.kick_holds", // 85
  "mob.active_leg_raises", // 86
  "pre.short_pre_stretch", // 87
];
const LEGACY = new Map(EX_KEYS.map((k, i) => [k, i]));
/** old numeric id → stable id (anything else is returned unchanged) */
export const keyOfLegacy = (n) => (typeof n === "number" && EX_KEYS[n] ? EX_KEYS[n] : n);
/** stable id → old numeric id (only for tests and for reading old data) */
export const legacyIndex = (key) => (LEGACY.has(key) ? LEGACY.get(key) : -1);
