  /* ============ Exercise sketches ============ */
  /*
   * Side-view pictograms in the trainer's style (round body, separate round head, thick rounded limbs).
   * A pose gives head h, shoulder s, hip p, hands w/W and feet f/F (capital = far side); elbows and knees
   * are solved from fixed segment lengths, bending towards the hint direction (ea/EA elbows, ka/KA knees).
   * Two poses (a → b) cross-fade to show the movement; props draw the equipment.
   */
  const SK = {
    W: "#F2EEE7",
    FAR: "#9E988F",
    BG: "#15171c",
    LINE: "#8C9099",
    BRASS: "#C9A86A",
    BAND: "#D9545C",
  };
  const skDir = (deg) => [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)];
  const skAlong = (a, d, len) => [a[0] + d[0] * len, a[1] + d[1] * len];
  /* two-segment limb from a to b; the middle joint bends towards the hint vector */
  function skJoint(a, b, l1, l2, hint) {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      d = Math.hypot(dx, dy) || 1;
    if (d >= l1 + l2 - 0.5)
      return [
        [a[0] + (dx / d) * l1, a[1] + (dy / d) * l1],
        [a[0] + (dx / d) * (l1 + l2), a[1] + (dy / d) * (l1 + l2)],
      ];
    const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d),
      y = Math.sqrt(Math.max(0, l1 * l1 - x * x)),
      mx = a[0] + (dx / d) * x,
      my = a[1] + (dy / d) * x,
      nx = -dy / d,
      ny = dx / d,
      s = nx * hint[0] + ny * hint[1] >= 0 ? 1 : -1;
    return [[mx + nx * y * s, my + ny * y * s], b];
  }
  const skPoly = (pts, w, col) =>
    `<polyline points="${pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ")}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  /* equipment held in the hands is drawn in front of the figure, everything else behind it */
  const SK_FRONT = new Set(["plate", "db", "kb", "handle", "band2", "towel"]);
  function skProp(pr) {
    const [k, a, b] = pr,
      L = SK.LINE;
    if (k === "floor") return `<line x1="8" y1="149" x2="232" y2="149" stroke="#2b2f36" stroke-width="2"/>`;
    if (k === "plate")
      return `<circle cx="${a[0]}" cy="${a[1]}" r="14" fill="${SK.BG}" stroke="${SK.BRASS}" stroke-width="5"/><circle cx="${a[0]}" cy="${a[1]}" r="3" fill="${L}"/>`;
    if (k === "db")
      return `<rect x="${a[0] - 9}" y="${a[1] - 3}" width="18" height="6" rx="2" fill="${L}"/><rect x="${a[0] - 13}" y="${a[1] - 7}" width="6" height="14" rx="2" fill="${SK.BRASS}"/><rect x="${a[0] + 7}" y="${a[1] - 7}" width="6" height="14" rx="2" fill="${SK.BRASS}"/>`;
    if (k === "kb")
      return `<circle cx="${a[0]}" cy="${a[1] + 11}" r="10" fill="${SK.BRASS}"/><path d="M${a[0] - 6} ${a[1] + 4} Q${a[0]} ${a[1] - 8} ${a[0] + 6} ${a[1] + 4}" fill="none" stroke="${SK.BRASS}" stroke-width="3"/>`;
    if (k === "pullbar")
      return `<line x1="70" y1="${a}" x2="170" y2="${a}" stroke="${L}" stroke-width="5" stroke-linecap="round"/><line x1="70" y1="${a}" x2="70" y2="2" stroke="${L}" stroke-width="3"/><line x1="170" y1="${a}" x2="170" y2="2" stroke="${L}" stroke-width="3"/>`;
    if (k === "rect") return `<rect x="${a[0]}" y="${a[1]}" width="${b[0]}" height="${b[1]}" rx="4" fill="#2a2e35"/>`;
    if (k === "cable")
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${L}" stroke-width="2"/><circle cx="${a[0]}" cy="${a[1]}" r="4" fill="${L}"/>`;
    if (k === "band")
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${SK.BAND}" stroke-width="3" stroke-linecap="round"/><circle cx="${a[0]}" cy="${a[1]}" r="4" fill="${L}"/>`;
    if (k === "tower") return `<rect x="${a}" y="6" width="10" height="143" rx="3" fill="#2a2e35"/>`;
    if (k === "rope")
      return `<path d="M${a[0]} ${a[1]} C${a[0] + 46} ${b} ${a[2] - 46} ${b} ${a[2]} ${a[1]}" fill="none" stroke="${L}" stroke-width="2.5"/>`;
    /* isometric neck work: pressure from the four directions – forehead and back of the head as arrows,
       the two sides as a dot (towards you) and a cross (away from you) above the head */
    if (k === "neck4") {
      const c = SK.BRASS,
        arrow = (x1, x2, y) =>
          `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M${x2 + (x2 > x1 ? -7 : 7)} ${y - 5} L${x2} ${y} L${x2 + (x2 > x1 ? -7 : 7)} ${y + 5}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      return (
        arrow(172, 150, 30) +
        arrow(68, 90, 38) +
        `<circle cx="136" cy="11" r="6" fill="none" stroke="${c}" stroke-width="2"/><circle cx="136" cy="11" r="1.8" fill="${c}"/>` +
        `<circle cx="104" cy="11" r="6" fill="none" stroke="${c}" stroke-width="2"/><path d="M100.5 7.5 L107.5 14.5 M107.5 7.5 L100.5 14.5" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
      );
    }
    if (k === "stairs") return `<path d="M112 149 V133 H136 V117 H160 V101 H184 V85 H232 V149 Z" fill="#2a2e35"/>`;
    if (k === "stick")
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#a88a5c" stroke-width="5" stroke-linecap="round"/>`;
    if (k === "knife")
      return `<line x1="${a[0] + 6}" y1="${a[1]}" x2="${a[0] - 16}" y2="${a[1] - 2}" stroke="${L}" stroke-width="3" stroke-linecap="round"/><line x1="${a[0] + 10}" y1="${a[1]}" x2="${a[0] + 2}" y2="${a[1]}" stroke="#3a3f47" stroke-width="5" stroke-linecap="round"/>`;
    if (k === "wall") return `<rect x="${a}" y="6" width="10" height="143" rx="3" fill="#2a2e35"/>`;
    if (k === "hill") return `<polygon points="0,149 240,101 240,149" fill="#22262d"/>`;
    if (k === "wheel") return `<circle cx="${a[0]}" cy="${a[1]}" r="${b}" fill="none" stroke="${L}" stroke-width="4"/>`;
    if (k === "line")
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${L}" stroke-width="${pr[3] || 3}" stroke-linecap="round"/>`;
    if (k === "band2")
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${SK.BAND}" stroke-width="5" stroke-linecap="round"/>`;
    if (k === "towel")
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#d8cfc0" stroke-width="9" stroke-linecap="round"/>`;
    if (k === "handle")
      return `<line x1="${a[0] - 18}" y1="${a[1]}" x2="${a[0] + 18}" y2="${a[1]}" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;
    return "";
  }
  /* limb lengths: upper arm 22, forearm 21, thigh 28, shin 27; trunk ~34, head radius 12 */
  function skFigure(q, pal, only) {
    const arm = (s, w, hint) => [s, ...skJoint(s, w, 22, 21, hint)],
      leg = (p, f, hint) => [p, ...skJoint(p, f, 28, 27, hint)];
    const W = q.W || q.w,
      F = q.F || q.f,
      cx = (q.s[0] + q.p[0]) / 2,
      cy = (q.s[1] + q.p[1]) / 2,
      len = Math.hypot(q.s[0] - q.p[0], q.s[1] - q.p[1]),
      rot = (Math.atan2(q.s[1] - q.p[1], q.s[0] - q.p[0]) * 180) / Math.PI;
    const near = pal ? pal.near : SK.W,
      far = pal ? pal.far : SK.FAR;
    if (only === "arm") return skPoly(arm(q.s, q.w, q.ea || [0, 1]), 10, near);
    let h = "";
    h += skPoly(arm(q.s, W, q.EA || q.ea || [0, 1]), 10, far);
    h += skPoly(leg(q.p, F, q.KA || q.ka || [1, 0]), 13, far);
    h += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(len / 2 + 8).toFixed(1)}" ry="15" transform="rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${near}" stroke="${SK.BG}" stroke-width="3"/>`;
    h += skPoly(leg(q.p, q.f, q.ka || [1, 0]), 13, near);
    h += `<circle cx="${q.h[0].toFixed(1)}" cy="${q.h[1].toFixed(1)}" r="12" fill="${near}" stroke="${SK.BG}" stroke-width="3"/>`;
    h += skPoly(arm(q.s, q.w, q.ea || [0, 1]), 10, near);
    return h;
  }
  /* curved arrow around a centre, angles in degrees (0 = right, clockwise) */
  function skArc(c, r, a0, a1) {
    if (Math.abs(a1 - a0) > 330) a1 = a0 + Math.sign(a1 - a0) * 330;
    const pt = (a) => [c[0] + r * Math.cos((a * Math.PI) / 180), c[1] + r * Math.sin((a * Math.PI) / 180)],
      p0 = pt(a0),
      p1 = pt(a1);
    return `<path d="M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}" fill="none" stroke="${SK.BRASS}" stroke-width="3" stroke-linecap="round" marker-end="url(#skHead)"/>`;
  }
  const skArrow = (a, b) =>
    `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${SK.BRASS}" stroke-width="3" stroke-linecap="round" marker-end="url(#skHead)"/>`;
  /* straight body line rising from the feet at an angle (planks, push-ups) */
  function skLine(f, deg, o = {}) {
    const d = skDir(deg),
      p = skAlong(f, d, 54),
      s = skAlong(p, d, 34),
      h = skAlong(s, d, 24);
    return { f, F: f, p, s, h, ...o };
  }
  const STAND = {
    h: [120, 36],
    s: [120, 60],
    p: [120, 94],
    w: [123, 100],
    W: [117, 100],
    f: [122, 148],
    F: [116, 148],
  };
  const st = (o) => ({ ...STAND, ...o });
  const SQUAT = {
    h: [123, 65],
    s: [112, 86],
    p: [96, 116],
    f: [126, 148],
    F: [120, 148],
    ka: [1, -0.4],
  };
  const SEAT = {
    p: [112, 114],
    s: [114, 80],
    h: [116, 56],
    f: [142, 148],
    F: [138, 148],
    ka: [1, -1],
  };
  const HINGE = (o) => ({
    p: [100, 96],
    s: [133, 88],
    h: [156, 82],
    f: [116, 148],
    F: [112, 148],
    ka: [1, -0.2],
    ...o,
  });
  const pu = skLine([40, 146], 28.5),
    pd = skLine([40, 146], 13),
    fp = skLine([40, 146], 14.5),
    HANG = {
      h: [131, 44],
      s: [120, 65],
      p: [120, 99],
      w: [118, 24],
      W: [124, 24],
      f: [104, 140],
      F: [108, 140],
      ka: [1, 0],
    },
    PULLED = {
      h: [131, 14],
      s: [120, 38],
      p: [120, 72],
      w: [118, 24],
      W: [124, 24],
      f: [104, 114],
      F: [108, 114],
      ea: [1, 1],
      ka: [1, 0],
    },
    BENCH = ["rect", [56, 118], [100, 8]],
    SUP = {
      p: [90, 110],
      s: [124, 110],
      h: [148, 106],
      f: [62, 148],
      F: [66, 148],
      ka: [-1, -1],
    };
  const cpl = skLine([66, 98], -20);
  /* Key = German exercise name. a/b = poses, props/pb = props per pose, arrow = movement, hold = static hold */
  const SKETCH = {
    "str.push_ups": {
      a: { ...pu, w: [119, 147], ea: [-1, 0] },
      b: { ...pd, w: [119, 147], ea: [-1, -0.3] },
      arrow: [
        [190, 94],
        [190, 120],
      ],
    },
    "str.plank_shoulder_taps": {
      a: { ...pu, w: [119, 147], ea: [-1, 0] },
      b: { ...pu, w: [pu.s[0] + 8, pu.s[1] + 10], W: [119, 147], ea: [1, 1] },
    },
    "str.plank": {
      a: { ...fp, w: [fp.s[0] + 21, 146], ea: [0, 1] },
      hold: true,
    },
    "str.hollow_hold": {
      a: {
        p: [100, 138],
        s: [134, 134],
        h: [156, 126],
        f: [50, 122],
        F: [50, 122],
        w: [184, 118],
        ka: [0, -1],
      },
      hold: true,
    },
    "str.pull_ups": {
      a: HANG,
      b: PULLED,
      props: [["pullbar", 24]],
      arrow: [
        [166, 96],
        [166, 62],
      ],
    },
    "str.negative_pull_ups": {
      a: PULLED,
      b: HANG,
      props: [["pullbar", 24]],
      arrow: [
        [166, 62],
        [166, 96],
      ],
    },
    "str.hanging_knee_raises": {
      a: HANG,
      b: {
        ...HANG,
        f: [150, 124],
        F: [152, 124],
        ka: [0.3, -1],
        KA: [0.3, -1],
      },
      props: [["pullbar", 24]],
      arrow: [
        [184, 134],
        [178, 104],
      ],
    },
    "str.dead_hang": { a: HANG, props: [["pullbar", 24]], hold: true },
    "str.barbell_back_squat": {
      a: st({ w: [116, 58], W: [116, 58], ea: [0, 1] }),
      b: { ...SQUAT, w: [108, 84], W: [108, 84], ea: [0, 1] },
      props: [["plate", [116, 62]]],
      pb: [["plate", [110, 82]]],
      arrow: [
        [176, 64],
        [176, 98],
      ],
    },
    "str.goblet_squats": {
      a: st({ w: [134, 72], W: [134, 72], ea: [0.3, 1] }),
      b: { ...SQUAT, w: [128, 98], W: [128, 98], ea: [0.3, 1] },
      props: [["kb", [134, 66]]],
      pb: [["kb", [128, 92]]],
      arrow: [
        [176, 64],
        [176, 98],
      ],
    },
    "str.barbell_romanian_deadlift": {
      a: st({ w: [126, 100], W: [126, 100] }),
      b: HINGE({ w: [136, 128], W: [136, 128], ea: [-1, 0] }),
      props: [["plate", [127, 104]]],
      pb: [["plate", [137, 130]]],
      arrow: [
        [180, 64],
        [186, 92],
      ],
    },
    "str.romanian_deadlift": {
      a: st({ w: [126, 100], W: [126, 100] }),
      b: HINGE({ w: [136, 128], W: [136, 128], ea: [-1, 0] }),
      props: [["db", [126, 102]]],
      pb: [["db", [136, 130]]],
      arrow: [
        [180, 64],
        [186, 92],
      ],
    },
    "cond.kettlebell_swings": {
      a: HINGE({ w: [118, 126], W: [118, 126], ea: [-1, 0] }),
      b: st({ w: [164, 64], W: [164, 64], ea: [0, 1] }),
      props: [["kb", [118, 124]]],
      pb: [["kb", [164, 60]]],
      arrow: [
        [150, 132],
        [178, 98],
      ],
    },
    "str.bench_press": {
      a: { ...SUP, w: [124, 68], ea: [-1, 0] },
      b: { ...SUP, w: [126, 94], ea: [-1, 0.6] },
      props: [BENCH, ["plate", [124, 66]]],
      pb: [BENCH, ["plate", [126, 92]]],
      arrow: [
        [184, 96],
        [184, 66],
      ],
    },
    "str.dumbbell_press": {
      a: { ...SUP, w: [124, 68], ea: [-1, 0] },
      b: { ...SUP, w: [126, 94], ea: [-1, 0.6] },
      props: [BENCH, ["db", [124, 66]]],
      pb: [BENCH, ["db", [126, 92]]],
      arrow: [
        [184, 96],
        [184, 66],
      ],
    },
    "str.lat_pulldown": {
      a: {
        p: [110, 114],
        s: [112, 80],
        h: [114, 56],
        f: [140, 148],
        F: [136, 148],
        ka: [1, -1],
        w: [118, 40],
        ea: [1, 0],
      },
      b: {
        p: [110, 114],
        s: [110, 80],
        h: [114, 56],
        f: [140, 148],
        F: [136, 148],
        ka: [1, -1],
        w: [130, 74],
        ea: [-0.3, 1],
      },
      props: [
        ["rect", [92, 118], [38, 8]],
        ["cable", [118, 4], [118, 40]],
        ["handle", [118, 40]],
      ],
      pb: [
        ["rect", [92, 118], [38, 8]],
        ["cable", [130, 4], [130, 74]],
        ["handle", [130, 74]],
      ],
      arrow: [
        [182, 40],
        [182, 74],
      ],
    },
    "str.seated_cable_row": {
      a: {
        p: [84, 126],
        s: [96, 94],
        h: [104, 72],
        f: [146, 138],
        F: [146, 138],
        ka: [0, -1],
        w: [134, 106],
        ea: [0, 1],
      },
      b: {
        p: [84, 126],
        s: [88, 92],
        h: [92, 68],
        f: [146, 138],
        F: [146, 138],
        ka: [0, -1],
        w: [108, 110],
        ea: [-1, 0],
      },
      props: [
        ["rect", [62, 128], [44, 8]],
        ["tower", 214],
        ["cable", [214, 114], [134, 106]],
      ],
      pb: [
        ["rect", [62, 128], [44, 8]],
        ["tower", 214],
        ["cable", [214, 114], [108, 110]],
      ],
      arrow: [
        [176, 90],
        [146, 90],
      ],
    },
    "str.band_rows": {
      a: st({ w: [160, 90], W: [160, 90], ea: [0, 1] }),
      b: st({ w: [136, 84], W: [136, 84], ea: [-1, 0.3] }),
      props: [["band", [222, 90], [160, 90]]],
      pb: [["band", [222, 90], [136, 84]]],
      arrow: [
        [190, 74],
        [160, 74],
      ],
    },
    "str.cable_face_pulls": {
      a: st({ w: [160, 48], W: [160, 48], ea: [0, 1] }),
      b: st({ w: [136, 38], W: [136, 38], ea: [-0.3, -1] }),
      props: [
        ["tower", 222],
        ["cable", [222, 46], [160, 48]],
      ],
      pb: [
        ["tower", 222],
        ["cable", [222, 46], [136, 38]],
      ],
      arrow: [
        [192, 24],
        [162, 24],
      ],
    },
    "str.band_face_pulls": {
      a: st({ w: [160, 48], W: [160, 48], ea: [0, 1] }),
      b: st({ w: [136, 38], W: [136, 38], ea: [-0.3, -1] }),
      props: [["band", [222, 46], [160, 48]]],
      pb: [["band", [222, 46], [136, 38]]],
      arrow: [
        [192, 24],
        [162, 24],
      ],
    },
    "str.pallof_press": {
      a: st({ w: [136, 80], W: [136, 80], ea: [0, 1] }),
      b: st({ w: [162, 78], W: [162, 78], ea: [0, 1] }),
      props: [["band", [20, 80], [136, 80]]],
      pb: [["band", [20, 80], [162, 78]]],
      arrow: [
        [150, 62],
        [174, 62],
      ],
    },
    "str.cable_woodchop": {
      a: st({
        w: [80, 26],
        W: [80, 26],
        ea: [0, -1],
        f: [134, 148],
        F: [104, 148],
      }),
      b: st({
        w: [164, 112],
        W: [164, 112],
        ea: [0, 1],
        f: [134, 148],
        F: [104, 148],
      }),
      props: [
        ["tower", 20],
        ["cable", [30, 16], [80, 26]],
      ],
      pb: [
        ["tower", 20],
        ["cable", [30, 16], [164, 112]],
      ],
      arrow: [
        [176, 18],
        [214, 70],
      ],
    },
    "str.seated_dumbbell_shoulder_press": {
      a: { ...SEAT, w: [126, 70], ea: [0, 1] },
      b: { ...SEAT, w: [118, 36], ea: [1, 0] },
      props: [
        ["rect", [92, 118], [38, 8]],
        ["db", [126, 68]],
      ],
      pb: [
        ["rect", [92, 118], [38, 8]],
        ["db", [118, 34]],
      ],
      arrow: [
        [172, 70],
        [172, 36],
      ],
    },
    "str.leg_press": {
      a: {
        p: [96, 124],
        s: [71, 101],
        h: [53, 85],
        f: [118, 100],
        F: [126, 94],
        ka: [-0.2, -1],
        KA: [-0.2, -1],
        w: [98, 118],
        ea: [0, 1],
      },
      b: {
        p: [96, 124],
        s: [71, 101],
        h: [53, 85],
        f: [140, 82],
        F: [140, 82],
        ka: [-0.2, -1],
        KA: [-0.2, -1],
        w: [98, 118],
        ea: [0, 1],
      },
      props: [
        ["rect", [50, 126], [60, 8]],
        ["plate", [124, 94]],
      ],
      pb: [
        ["rect", [50, 126], [60, 8]],
        ["plate", [146, 76]],
      ],
      arrow: [
        [156, 118],
        [180, 94],
      ],
    },
    "str.barbell_hip_thrust": {
      a: {
        s: [64, 112],
        h: [42, 106],
        p: [88, 136],
        f: [124, 148],
        F: [124, 148],
        ka: [0, -1],
        w: [86, 124],
        ea: [0, -1],
      },
      b: {
        s: [64, 112],
        h: [42, 106],
        p: [96, 116],
        f: [124, 148],
        F: [124, 148],
        ka: [0, -1],
        w: [94, 104],
        ea: [0, -1],
      },
      props: [
        ["rect", [20, 118], [48, 31]],
        ["plate", [88, 122]],
      ],
      pb: [
        ["rect", [20, 118], [48, 31]],
        ["plate", [96, 102]],
      ],
      arrow: [
        [170, 136],
        [170, 108],
      ],
    },
    "str.glute_bridges": {
      a: {
        s: [66, 140],
        h: [44, 138],
        p: [98, 142],
        f: [128, 148],
        F: [128, 148],
        ka: [0, -1],
        w: [90, 146],
        ea: [0, -1],
      },
      b: {
        s: [66, 140],
        h: [44, 138],
        p: [100, 118],
        f: [128, 148],
        F: [128, 148],
        ka: [0, -1],
        w: [90, 146],
        ea: [0, -1],
      },
      arrow: [
        [170, 140],
        [170, 112],
      ],
    },
    "str.dead_bugs": {
      a: {
        s: [138, 138],
        p: [104, 138],
        h: [162, 134],
        w: [140, 96],
        W: [136, 96],
        f: [80, 108],
        F: [76, 108],
        ka: [1, -1],
        KA: [1, -1],
        ea: [1, 0],
      },
      b: {
        s: [138, 138],
        p: [104, 138],
        h: [162, 134],
        w: [182, 132],
        W: [136, 96],
        f: [80, 108],
        F: [52, 134],
        ka: [1, -1],
        KA: [0, -1],
        ea: [0, -1],
      },
    },
    "str.russian_twists": {
      a: {
        p: [104, 130],
        s: [94, 98],
        h: [88, 75],
        f: [146, 116],
        F: [146, 116],
        ka: [0, -1],
        KA: [0, -1],
        w: [74, 118],
        ea: [0, 1],
      },
      b: {
        p: [104, 130],
        s: [94, 98],
        h: [88, 75],
        f: [146, 116],
        F: [146, 116],
        ka: [0, -1],
        KA: [0, -1],
        w: [134, 112],
        ea: [0, 1],
      },
      arrow: [
        [78, 144],
        [140, 144],
      ],
    },
    "str.lunges": {
      a: st({}),
      b: {
        h: [120, 62],
        s: [118, 86],
        p: [116, 120],
        w: [120, 124],
        W: [112, 124],
        f: [146, 148],
        F: [84, 146],
        ka: [1, -1],
        KA: [0, 1],
      },
      arrow: [
        [184, 64],
        [184, 92],
      ],
    },
    "str.bulgarian_split_squats": {
      a: {
        h: [118, 38],
        s: [116, 62],
        p: [114, 96],
        w: [118, 100],
        f: [130, 148],
        F: [74, 120],
        ka: [1, -1],
        KA: [0, 1],
      },
      b: {
        h: [114, 60],
        s: [112, 84],
        p: [110, 118],
        w: [114, 122],
        f: [134, 148],
        F: [74, 120],
        ka: [1, -1],
        KA: [0, 1],
      },
      props: [["rect", [44, 122], [40, 8]]],
      arrow: [
        [184, 64],
        [184, 92],
      ],
    },
    "str.step_ups": {
      a: {
        h: [118, 36],
        s: [118, 60],
        p: [118, 94],
        w: [122, 100],
        f: [154, 126],
        F: [114, 148],
        ka: [1, -1],
      },
      b: {
        h: [156, 14],
        s: [156, 38],
        p: [156, 72],
        w: [160, 78],
        f: [158, 126],
        F: [152, 126],
        ka: [1, 0],
      },
      props: [["rect", [130, 127], [56, 22]]],
      arrow: [
        [196, 70],
        [196, 40],
      ],
    },
    "str.single_leg_calf_raises": {
      a: {
        h: [120, 22],
        s: [120, 46],
        p: [120, 80],
        w: [123, 86],
        W: [117, 86],
        f: [124, 134],
        F: [98, 104],
        KA: [-1, 0],
      },
      b: {
        h: [120, 14],
        s: [120, 38],
        p: [120, 72],
        w: [123, 78],
        W: [117, 78],
        f: [126, 128],
        F: [98, 96],
        KA: [-1, 0],
      },
      props: [["rect", [104, 135], [40, 14]]],
      arrow: [
        [170, 62],
        [170, 40],
      ],
    },
    "str.copenhagen_plank": {
      a: {
        ...cpl,
        w: [cpl.s[0] + 20, 146],
        ea: [0, 1],
        F: [92, 146],
        KA: [0, 1],
      },
      props: [["rect", [26, 100], [44, 8]]],
      hold: true,
    },
    "str.single_leg_kick_hold": {
      a: st({ w: [136, 52], W: [130, 48], ea: [0.5, 1] }),
      b: st({
        w: [136, 52],
        W: [130, 48],
        ea: [0.5, 1],
        f: [170, 84],
        ka: [0, -1],
      }),
      arrow: [
        [196, 130],
        [196, 96],
      ],
    },
    "str.neck_iso_hold": { a: st({ w: [134, 32], ea: [1, 1] }), props: [["neck4"]], hold: true },
    /* conditioning (round-based, shown in the full-screen timer) */
    "cond.burpees": {
      a: { ...pu, w: [119, 147], ea: [-1, 0] },
      b: {
        h: [121, 26],
        s: [120, 50],
        p: [120, 84],
        w: [124, 8],
        W: [116, 8],
        f: [124, 136],
        F: [118, 136],
        ea: [1, 0],
        ka: [1, 0],
      },
      arrow: [
        [186, 120],
        [186, 70],
      ],
    },
    "cond.mountain_climbers": {
      a: { ...pu, w: [119, 147], ea: [-1, 0], f: [104, 142], ka: [1, 1] },
      b: { ...pu, w: [119, 147], ea: [-1, 0], F: [104, 142], KA: [1, 1] },
      arrow: [
        [150, 132],
        [176, 132],
      ],
    },
    "cond.skater_jumps": {
      a: {
        h: [96, 58],
        s: [88, 80],
        p: [74, 106],
        f: [86, 148],
        F: [46, 122],
        ka: [1, -1],
        KA: [0, 1],
        w: [106, 112],
        W: [56, 84],
        ea: [0, 1],
      },
      b: {
        h: [166, 58],
        s: [158, 80],
        p: [144, 106],
        f: [156, 148],
        F: [116, 122],
        ka: [1, -1],
        KA: [0, 1],
        w: [176, 112],
        W: [126, 84],
        ea: [0, 1],
      },
      arrow: [
        [100, 40],
        [150, 40],
      ],
    },
    "cond.bear_crawl": {
      a: {
        p: [92, 106],
        s: [132, 102],
        h: [154, 96],
        w: [136, 147],
        W: [130, 147],
        f: [70, 148],
        F: [78, 148],
        ka: [1, 0],
        KA: [1, 0],
        ea: [-1, 0],
      },
      b: {
        p: [100, 106],
        s: [140, 102],
        h: [162, 96],
        w: [160, 147],
        W: [138, 147],
        f: [78, 148],
        F: [96, 148],
        ka: [1, 0],
        KA: [1, 0],
        ea: [-1, 0],
      },
      arrow: [
        [184, 128],
        [212, 128],
      ],
    },
    "cond.band_punches": {
      a: {
        h: [124, 38],
        s: [118, 62],
        p: [114, 96],
        f: [138, 148],
        F: [100, 148],
        ka: [1, -0.3],
        w: [138, 50],
        W: [134, 46],
        ea: [0, 1],
        EA: [0, 1],
      },
      b: {
        h: [128, 38],
        s: [124, 62],
        p: [114, 96],
        f: [138, 148],
        F: [100, 148],
        ka: [1, -0.3],
        w: [166, 60],
        W: [134, 46],
        ea: [0, 1],
        EA: [0, 1],
      },
      props: [["band", [20, 64], [138, 50]]],
      pb: [["band", [20, 64], [166, 60]]],
      arrow: [
        [178, 40],
        [204, 40],
      ],
    },
    "cond.shadow_sprints": {
      a: {
        h: [126, 38],
        s: [120, 62],
        p: [114, 96],
        f: [138, 148],
        F: [100, 148],
        ka: [1, -0.3],
        w: [136, 48],
        W: [164, 58],
        ea: [0, 1],
        EA: [0, 1],
      },
      b: {
        h: [128, 38],
        s: [124, 62],
        p: [114, 96],
        f: [138, 148],
        F: [100, 148],
        ka: [1, -0.3],
        w: [168, 58],
        W: [140, 50],
        ea: [0, 1],
        EA: [0, 1],
      },
    },
    "cond.bag_sprints": {
      a: {
        h: [116, 38],
        s: [110, 62],
        p: [104, 96],
        f: [128, 148],
        F: [90, 148],
        ka: [1, -0.3],
        w: [126, 48],
        W: [154, 58],
        ea: [0, 1],
        EA: [0, 1],
      },
      b: {
        h: [118, 38],
        s: [114, 62],
        p: [104, 96],
        f: [128, 148],
        F: [90, 148],
        ka: [1, -0.3],
        w: [158, 58],
        W: [130, 50],
        ea: [0, 1],
        EA: [0, 1],
      },
      props: [
        ["cable", [180, 2], [180, 22]],
        ["rect", [164, 22], [34, 100]],
      ],
    },
    "cond.rope_intervals": {
      a: {
        ...STAND,
        w: [134, 100],
        W: [108, 100],
        f: [124, 148],
        F: [118, 148],
        ea: [0, 1],
      },
      b: {
        h: [120, 26],
        s: [120, 50],
        p: [120, 84],
        w: [134, 90],
        W: [108, 90],
        f: [124, 136],
        F: [118, 136],
        ea: [0, 1],
      },
      props: [["rope", [134, 100, 108], -30]],
      pb: [["rope", [134, 90, 108], 176]],
    },
    "cond.kick_intervals": {
      a: {
        h: [124, 38],
        s: [118, 62],
        p: [114, 96],
        f: [138, 148],
        F: [100, 148],
        ka: [1, -0.3],
        w: [134, 48],
        W: [138, 52],
        ea: [0, 1],
        EA: [0, 1],
      },
      b: {
        h: [96, 46],
        s: [106, 68],
        p: [118, 98],
        f: [174, 84],
        F: [112, 148],
        ka: [0, -1],
        KA: [1, 0],
        w: [118, 50],
        W: [124, 56],
        ea: [0, 1],
        EA: [0, 1],
      },
      arrow: [
        [150, 140],
        [188, 104],
      ],
    },
    "cond.stair_or_bench_runs": {
      a: {
        h: [126, 40],
        s: [120, 64],
        p: [114, 98],
        f: [128, 132],
        F: [104, 148],
        ka: [1, -1],
        w: [138, 84],
        W: [100, 92],
        ea: [0, 1],
        EA: [0, 1],
      },
      b: {
        h: [152, 26],
        s: [146, 50],
        p: [140, 84],
        f: [152, 116],
        F: [128, 132],
        ka: [1, -1],
        w: [128, 78],
        W: [162, 70],
        ea: [0, 1],
        EA: [0, 1],
      },
      props: [["stairs"]],
      arrow: [
        [60, 116],
        [90, 86],
      ],
    },
  };
  function sketchSvg(name, fast) {
    const k = SKETCH[name];
    if (!k) return "";
    const b = k.b || k.a,
      layer = (q, props, cls) =>
        `<g class="${cls}">${(props || [])
          .filter((x) => !SK_FRONT.has(x[0]))
          .map(skProp)
          .join("")}${skFigure(q)}${(props || [])
          .filter((x) => SK_FRONT.has(x[0]))
          .map(skProp)
          .join("")}</g>`;
    return `<svg class="sketch${k.b ? " moving" : ""}${fast ? " fast" : ""}" viewBox="0 0 240 156" role="img" aria-label="${esc(EX[name] ? (S.profile.lang === "de" ? EX[name].de : EX[name].en) : name)}"><defs><marker id="skHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${SK.BRASS}"/></marker></defs>${skProp(["floor"])}${layer(k.a, k.props, "fa")}${k.b ? layer(b, k.pb || k.props, "fb") : ""}${k.arrow ? skArrow(...k.arrow) : ""}${k.arc ? skArc(...k.arc) : ""}</svg>`;
  }

  /* ============ Self-defence sketches: you (light) and the attacker (grey), with the key move of the release ============ */
  const SD_PAL = { near: "#8f8a83", far: "#5d5954" };
  const skShift = (q, dx, dy = 0) => {
    const o = {};
    for (const k in q)
      o[k] =
        Array.isArray(q[k]) && typeof q[k][0] === "number" && "hspwWfF".includes(k)
          ? [q[k][0] + dx, q[k][1] + dy]
          : q[k];
    return o;
  };
  /* attackers facing left */
  const ATK = {
    h: [150, 36],
    s: [150, 60],
    p: [150, 94],
    f: [144, 148],
    F: [156, 148],
    ka: [-1, 0],
    KA: [-1, 0],
  };
  const SDSK = {
    /* choke from the front: arm straight up and turn */
    "1.sd.0": {
      parts: [
        [
          "d",
          st({
            h: [104, 38],
            s: [104, 62],
            p: [104, 96],
            w: [112, 96],
            W: [100, 98],
            f: [96, 148],
            F: [110, 148],
          }),
        ],
        [
          "a",
          {
            ...ATK,
            h: [146, 38],
            w: [114, 52],
            W: [118, 56],
            ea: [0, 1],
            EA: [0, 1],
          },
        ],
      ],
      arrow: [
        [78, 100],
        [78, 26],
      ],
    },
    /* choke from behind: arm up and turn towards the attacker */
    "1.sd.1": {
      parts: [
        [
          "a",
          st({
            h: [100, 38],
            s: [102, 62],
            p: [102, 96],
            W: [130, 56],
            f: [96, 148],
            F: [108, 148],
            EA: [0, 1],
          }),
        ],
        [
          "d",
          st({
            h: [132, 38],
            s: [130, 62],
            p: [130, 96],
            w: [138, 98],
            W: [126, 98],
            f: [134, 148],
            F: [124, 148],
          }),
        ],
        ["a", st({ s: [102, 62], w: [134, 52], ea: [0, 1] }), "arm"],
      ],
      arrow: [
        [164, 100],
        [164, 26],
      ],
    },
    /* headlock from the side: free hand over the shoulder to the face, pull the head back */
    "2.sd.0": {
      parts: [
        [
          "a",
          st({
            h: [146, 36],
            s: [144, 60],
            p: [144, 94],
            w: [138, 96],
            W: [150, 98],
            f: [150, 148],
            F: [138, 148],
            ea: [1, 0],
          }),
        ],
        [
          "d",
          {
            p: [90, 100],
            s: [120, 92],
            h: [140, 90],
            f: [96, 148],
            F: [86, 148],
            ka: [1, 0],
            w: [132, 120],
            W: [118, 70],
            ea: [0, 1],
            EA: [0, -1],
          },
        ],
        ["a", st({ s: [144, 60], w: [136, 100], ea: [1, -0.2] }), "arm"],
      ],
      arrow: [
        [112, 64],
        [146, 30],
      ],
    },
    /* forearm choke from behind: pull the forearm down, sink, elbow back */
    "2.sd.1": {
      parts: [
        [
          "a",
          st({
            h: [104, 36],
            s: [104, 60],
            p: [104, 94],
            W: [126, 66],
            f: [98, 148],
            F: [110, 148],
            EA: [1, 1],
          }),
        ],
        [
          "d",
          st({
            h: [130, 42],
            s: [128, 66],
            p: [126, 100],
            w: [138, 58],
            W: [134, 60],
            f: [136, 148],
            F: [120, 148],
            ea: [1, 1],
            EA: [1, 1],
            ka: [1, -0.3],
          }),
        ],
        ["a", st({ s: [104, 60], w: [140, 56], ea: [0, 1] }), "arm"],
      ],
      arrow: [
        [170, 104],
        [138, 104],
      ],
    },
    /* nelson: press the arms down, weight low */
    "2.sd.2": {
      parts: [
        [
          "a",
          st({
            h: [104, 36],
            s: [106, 60],
            p: [106, 94],
            W: [124, 52],
            f: [100, 148],
            F: [112, 148],
            EA: [1, 1],
          }),
        ],
        [
          "d",
          st({
            h: [140, 46],
            s: [130, 66],
            p: [126, 98],
            w: [142, 34],
            W: [138, 32],
            f: [136, 148],
            F: [120, 148],
            ea: [1, 0],
            EA: [1, 0],
          }),
        ],
        ["a", st({ s: [106, 60], w: [124, 48], ea: [1, 1] }), "arm"],
      ],
      arrow: [
        [166, 34],
        [166, 82],
      ],
    },
    /* bear hug under the arms (front): hips back, push the chin away */
    "3.sd.0": {
      parts: [
        [
          "a",
          {
            ...ATK,
            h: [134, 44],
            s: [136, 66],
            p: [146, 98],
            w: [104, 80],
            W: [104, 82],
            ea: [0, 1],
            EA: [0, 1],
          },
        ],
        [
          "d",
          st({
            h: [106, 36],
            s: [106, 60],
            p: [102, 94],
            w: [128, 42],
            W: [124, 50],
            f: [92, 148],
            F: [104, 148],
            ea: [0, 1],
            EA: [0, 1],
          }),
        ],
        ["a", { ...ATK, s: [136, 66], w: [104, 80], ea: [0, 1] }, "arm"],
      ],
      arrow: [
        [72, 96],
        [44, 96],
      ],
    },
    /* bear hug over the arms (front): weight down, hands to the hips, make space */
    "3.sd.1": {
      parts: [
        [
          "d",
          st({
            h: [106, 38],
            s: [106, 62],
            p: [104, 96],
            w: [118, 88],
            W: [114, 88],
            f: [92, 148],
            F: [104, 148],
            ea: [0, 1],
          }),
        ],
        [
          "a",
          {
            ...ATK,
            h: [134, 40],
            s: [134, 64],
            p: [144, 98],
            w: [100, 70],
            W: [104, 74],
            ea: [0, 1],
            EA: [0, 1],
          },
        ],
      ],
      arrow: [
        [76, 54],
        [76, 108],
      ],
    },
    /* stick attack from above: step in close, double forearm block on the arm */
    "4.sd.0": {
      parts: [
        ["a", { ...ATK, h: [150, 36], w: [146, 14], W: [160, 92], ea: [1, 0] }],
        [
          "d",
          st({
            h: [112, 38],
            s: [110, 62],
            p: [106, 96],
            w: [134, 22],
            W: [128, 30],
            f: [124, 148],
            F: [96, 148],
            ea: [0, 1],
            EA: [0, 1],
            ka: [1, -0.3],
          }),
        ],
      ],
      props: [["stick", [146, 14], [186, 0]]],
      arrow: [
        [70, 140],
        [100, 140],
      ],
    },
    /* knife thrust: step out of the line, parry and control the arm */
    "5.sd.0": {
      parts: [
        [
          "a",
          {
            ...ATK,
            h: [146, 40],
            s: [144, 64],
            p: [150, 98],
            f: [128, 148],
            F: [168, 148],
            w: [112, 82],
            W: [160, 92],
            ea: [0, 1],
          },
        ],
        [
          "d",
          st({
            h: [96, 36],
            s: [96, 60],
            p: [94, 94],
            w: [116, 80],
            W: [112, 70],
            f: [100, 148],
            F: [86, 148],
            ea: [0, 1],
            EA: [0, 1],
          }),
        ],
      ],
      props: [["knife", [112, 82]]],
      arrow: [
        [60, 120],
        [60, 84],
      ],
    },
    /* choke on the ground: bridge the hips up and roll */
    "6.sd.0": {
      parts: [
        [
          "d",
          {
            s: [76, 140],
            p: [110, 140],
            h: [52, 138],
            f: [140, 148],
            F: [136, 148],
            ka: [0, -1],
            KA: [0, -1],
            w: [96, 118],
            W: [92, 120],
            ea: [0, -1],
          },
        ],
        [
          "a",
          {
            h: [80, 88],
            s: [96, 104],
            p: [118, 126],
            f: [138, 148],
            F: [134, 148],
            ka: [-1, 0.6],
            KA: [-1, 0.6],
            w: [64, 132],
            W: [66, 134],
            ea: [0, 1],
            EA: [0, 1],
          },
        ],
      ],
      arrow: [
        [160, 136],
        [160, 100],
      ],
    },
    /* stick, defender on the ground: feet to the attacker, kick the knee */
    "6.sd.1": {
      parts: [
        [
          "d",
          {
            s: [54, 132],
            p: [84, 140],
            h: [34, 124],
            f: [130, 112],
            F: [112, 146],
            ka: [0, -1],
            KA: [0, -1],
            w: [62, 108],
            W: [58, 112],
            ea: [0, -1],
          },
        ],
        [
          "a",
          {
            ...ATK,
            h: [168, 36],
            s: [168, 60],
            p: [168, 94],
            f: [150, 148],
            F: [180, 148],
            w: [162, 14],
            W: [176, 92],
            ea: [1, 0],
          },
        ],
      ],
      props: [["stick", [162, 14], [204, 2]]],
      arrow: [
        [118, 96],
        [146, 116],
      ],
    },
    /* kick, defender on the ground: cover, catch the leg or kick the standing leg */
    "6.sd.2": {
      parts: [
        [
          "d",
          {
            s: [54, 132],
            p: [84, 140],
            h: [34, 124],
            f: [116, 118],
            F: [112, 146],
            ka: [0, -1],
            KA: [0, -1],
            w: [56, 106],
            W: [50, 110],
            ea: [1, -1],
          },
        ],
        [
          "a",
          {
            ...ATK,
            h: [170, 40],
            s: [168, 64],
            p: [164, 98],
            f: [124, 120],
            F: [172, 148],
            ka: [0, -1],
            w: [182, 60],
            W: [176, 54],
            ea: [0, 1],
          },
        ],
      ],
      arrow: [
        [100, 96],
        [134, 140],
      ],
    },
  };
  /* ============ More sketches: warm-up, mobility, cool-down, running and machines, solo hardening ============ */
  const RUN_A = {
      h: [128, 36],
      s: [122, 60],
      p: [114, 94],
      f: [146, 126],
      F: [86, 140],
      ka: [1, 0],
      KA: [0, 1],
      w: [104, 82],
      W: [144, 66],
      ea: [-1, 0.3],
      EA: [1, 1],
    },
    RUN_B = {
      h: [128, 36],
      s: [122, 60],
      p: [114, 94],
      f: [86, 140],
      F: [146, 126],
      ka: [0, 1],
      KA: [1, 0],
      w: [144, 66],
      W: [104, 82],
      ea: [1, 1],
      EA: [-1, 0.3],
    },
    SPR_A = {
      ...RUN_A,
      h: [140, 42],
      s: [132, 64],
      f: [150, 122],
      F: [80, 140],
      w: [106, 88],
      W: [154, 66],
    },
    SPR_B = {
      ...RUN_B,
      h: [140, 42],
      s: [132, 64],
      f: [80, 140],
      F: [150, 122],
      w: [154, 66],
      W: [106, 88],
    },
    WALK_A = {
      ...STAND,
      f: [136, 148],
      F: [104, 148],
      ka: [1, 0],
      KA: [0, 1],
      w: [104, 92],
      W: [140, 82],
      ea: [-1, 0.3],
      EA: [1, 1],
    },
    WALK_B = {
      ...STAND,
      f: [104, 148],
      F: [136, 148],
      ka: [0, 1],
      KA: [1, 0],
      w: [140, 82],
      W: [104, 92],
      ea: [1, 1],
      EA: [-1, 0.3],
    },
    QUAD = {
      p: [96, 110],
      s: [138, 108],
      h: [158, 100],
      w: [140, 147],
      W: [134, 147],
      f: [64, 146],
      F: [68, 146],
      ka: [0, 1],
      KA: [0, 1],
      ea: [-1, 0],
    },
    LUNGE_K = {
      p: [112, 112],
      s: [114, 78],
      h: [116, 54],
      f: [150, 148],
      F: [70, 146],
      ka: [1, -1],
      KA: [0, 1],
      w: [120, 104],
      W: [114, 104],
      ea: [1, 0],
    },
    TREAD = [
      ["rect", [52, 140], [140, 9]],
      ["line", [178, 140], [196, 70], 5],
      ["rect", [184, 60], [28, 12]],
    ],
    BIKE = [
      ["wheel", [70, 128], 20],
      ["wheel", [178, 128], 20],
      ["line", [70, 128], [112, 128], 4],
      ["line", [112, 128], [100, 92], 4],
      ["line", [112, 128], [160, 92], 4],
      ["line", [160, 92], [178, 128], 4],
      ["line", [100, 92], [70, 128], 4],
      ["line", [90, 89], [112, 89], 6],
      ["line", [160, 92], [164, 80], 4],
      ["line", [156, 80], [170, 80], 5],
      ["wheel", [112, 128], 9],
    ],
    BIKE_A = {
      p: [102, 86],
      s: [134, 66],
      h: [154, 56],
      w: [160, 80],
      W: [164, 80],
      ea: [0, 1],
      EA: [0, 1],
      f: [118, 136],
      F: [106, 119],
      ka: [1, -0.3],
      KA: [1, -0.6],
    },
    ROWER = [
      ["rect", [26, 140], [186, 6]],
      ["wheel", [206, 120], 17],
      ["line", [196, 140], [206, 120], 4],
      ["line", [160, 140], [166, 132], 6],
    ];
  Object.assign(SKETCH, {
    /* warm-up */
    "warm.easy_jump_rope": SKETCH["cond.rope_intervals"],
    "warm.easy_jog": {
      a: RUN_A,
      b: RUN_B,
      arrow: [
        [176, 140],
        [206, 140],
      ],
    },
    "warm.joint_mobility": {
      a: st({ w: [126, 16], W: [118, 18], ea: [0, -1], EA: [0, -1] }),
      b: st({ w: [160, 74], W: [156, 78], ea: [0, 1], EA: [0, 1] }),
      arc: [[120, 60], 52, -150, 30],
    },
    "warm.dynamic_stretching": {
      a: st({
        f: [168, 104],
        ka: [1, 0],
        w: [84, 70],
        ea: [0, 1],
        W: [116, 100],
      }),
      b: st({
        f: [82, 134],
        ka: [0, 1],
        w: [84, 70],
        ea: [0, 1],
        W: [116, 100],
      }),
      props: [["wall", 62]],
      arc: [[120, 94], 54, 120, 20],
    },
    "warm.band_activation": {
      a: st({ w: [162, 64], W: [158, 62], ea: [0, 1], EA: [0, 1] }),
      b: st({ w: [124, 62], W: [116, 62], ea: [1, -0.2], EA: [-1, -0.2] }),
      props: [["band2", [162, 64], [158, 62]]],
      pb: [["band2", [124, 62], [116, 62]]],
      arrow: [
        [178, 44],
        [140, 44],
      ],
    },
    /* mobility */
    "mob.quadruped_hip_circles": {
      a: QUAD,
      b: { ...QUAD, f: [86, 112], ka: [-1, 0] },
      arc: [[94, 120], 26, 200, 520],
    },
    "mob.90_90_hip_switches": {
      a: {
        p: [108, 140],
        s: [110, 104],
        h: [112, 80],
        f: [150, 146],
        F: [146, 146],
        ka: [0, -1],
        KA: [0, -1],
        w: [92, 146],
        W: [96, 146],
        ea: [-1, 0],
      },
      b: {
        p: [108, 140],
        s: [110, 104],
        h: [112, 80],
        f: [70, 146],
        F: [74, 146],
        ka: [0, -1],
        KA: [0, -1],
        w: [130, 146],
        W: [126, 146],
        ea: [1, 0],
      },
      arc: [[110, 128], 34, 340, 200],
    },
    "mob.cossack_squats": {
      a: {
        p: [96, 126],
        s: [104, 94],
        h: [110, 70],
        f: [102, 148],
        ka: [1, -1],
        F: [178, 148],
        KA: [0, -1],
        w: [124, 112],
        W: [118, 114],
        ea: [0, 1],
      },
      b: {
        p: [144, 126],
        s: [136, 94],
        h: [130, 70],
        f: [138, 148],
        ka: [-1, -1],
        F: [62, 148],
        KA: [0, -1],
        w: [116, 112],
        W: [122, 114],
        ea: [0, 1],
      },
      arrow: [
        [90, 40],
        [150, 40],
      ],
    },
    "mob.worlds_greatest_stretch": {
      a: {
        p: [110, 118],
        s: [140, 100],
        h: [160, 94],
        f: [152, 148],
        F: [52, 146],
        ka: [1, -1],
        KA: [0, 1],
        w: [150, 146],
        W: [144, 146],
        ea: [-1, 0],
      },
      b: {
        p: [110, 118],
        s: [140, 100],
        h: [158, 88],
        f: [152, 148],
        F: [52, 146],
        ka: [1, -1],
        KA: [0, 1],
        w: [144, 57],
        W: [144, 146],
        ea: [1, 0],
      },
      arrow: [
        [186, 120],
        [186, 60],
      ],
    },
    "mob.open_book_rotation": {
      a: {
        p: [104, 140],
        s: [140, 136],
        h: [162, 132],
        f: [100, 146],
        F: [104, 146],
        ka: [1, -1],
        KA: [1, -1],
        w: [182, 140],
        W: [184, 144],
        ea: [0, -1],
      },
      b: {
        p: [104, 140],
        s: [140, 136],
        h: [158, 126],
        f: [100, 146],
        F: [104, 146],
        ka: [1, -1],
        KA: [1, -1],
        w: [104, 120],
        W: [184, 144],
        ea: [0, -1],
      },
      arc: [[140, 130], 40, -10, -170],
    },
    "mob.knee_to_wall_ankle": {
      a: {
        p: [126, 116],
        s: [130, 82],
        h: [134, 58],
        f: [168, 148],
        F: [92, 146],
        ka: [1, -1],
        KA: [0, 1],
        w: [188, 78],
        W: [190, 82],
        ea: [0, 1],
      },
      b: {
        p: [138, 116],
        s: [142, 82],
        h: [146, 58],
        f: [168, 148],
        F: [104, 146],
        ka: [1, -1],
        KA: [0, 1],
        w: [188, 78],
        W: [190, 82],
        ea: [0, 1],
      },
      props: [["wall", 196]],
      arrow: [
        [150, 98],
        [178, 98],
      ],
    },
    "mob.band_dislocates": {
      a: st({ w: [150, 100], W: [146, 100], ea: [0, 1], EA: [0, 1] }),
      b: st({ w: [92, 42], W: [96, 40], ea: [-1, -1], EA: [-1, -1] }),
      props: [["band2", [150, 100], [146, 100]]],
      pb: [["band2", [92, 42], [96, 40]]],
      arc: [[120, 60], 50, 40, -200],
    },
    "mob.frog_stretch": {
      a: {
        p: [104, 118],
        s: [140, 126],
        h: [162, 128],
        f: [70, 146],
        F: [74, 146],
        ka: [0, 1],
        KA: [0, 1],
        w: [162, 146],
        W: [158, 146],
        ea: [0, 1],
      },
      b: {
        p: [84, 124],
        s: [122, 130],
        h: [144, 132],
        f: [70, 146],
        F: [74, 146],
        ka: [0, 1],
        KA: [0, 1],
        w: [146, 146],
        W: [142, 146],
        ea: [0, 1],
      },
      arrow: [
        [60, 104],
        [36, 104],
      ],
    },
    "mob.pigeon_stretch": {
      a: {
        p: [104, 132],
        s: [110, 98],
        h: [114, 74],
        f: [100, 148],
        ka: [1, 0.2],
        F: [32, 146],
        KA: [0, -1],
        w: [130, 146],
        W: [126, 146],
        ea: [1, 0],
      },
      b: {
        p: [104, 134],
        s: [138, 128],
        h: [160, 128],
        f: [100, 148],
        ka: [1, 0.2],
        F: [32, 146],
        KA: [0, -1],
        w: [184, 146],
        W: [180, 146],
        ea: [0, -1],
      },
      arc: [[106, 132], 44, -95, -20],
    },
    "mob.cat_cow": {
      a: { ...QUAD, p: [96, 104], s: [138, 102], h: [152, 118] },
      b: { ...QUAD, p: [96, 114], s: [138, 112], h: [162, 92] },
      arrow: [
        [117, 74],
        [117, 100],
      ],
    },
    "mob.deep_squat_hold": {
      a: {
        p: [104, 134],
        s: [116, 102],
        h: [128, 80],
        f: [126, 148],
        F: [122, 148],
        ka: [1, -1],
        KA: [1, -1],
        w: [142, 112],
        W: [140, 110],
        ea: [0, 1],
        EA: [0, 1],
      },
      hold: true,
    },
    "mob.neck_mobility": {
      a: st({ h: [114, 36] }),
      b: st({ h: [130, 42] }),
      arc: [[121, 38], 24, -160, -20],
    },
    /* cool-down */
    "cool.hip_flexor_stretch": {
      a: LUNGE_K,
      b: {
        ...LUNGE_K,
        p: [122, 116],
        s: [122, 82],
        h: [122, 58],
        w: [126, 106],
        W: [120, 106],
      },
      arrow: [
        [150, 104],
        [176, 104],
      ],
      hold: true,
    },
    "cool.adductors_and_splits": {
      a: {
        p: [120, 112],
        s: [120, 78],
        h: [120, 54],
        f: [172, 148],
        F: [68, 148],
        ka: [0, -1],
        KA: [0, -1],
        w: [140, 112],
        W: [100, 112],
        ea: [1, 0],
        EA: [-1, 0],
      },
      hold: true,
    },
    "cool.hamstrings": {
      a: {
        p: [94, 138],
        s: [126, 120],
        h: [148, 114],
        f: [152, 146],
        F: [150, 146],
        ka: [0, -1],
        KA: [0, -1],
        w: [152, 140],
        W: [148, 140],
        ea: [0, -1],
      },
      hold: true,
    },
    "cool.shoulder_and_chest": {
      a: st({ w: [76, 60], W: [116, 100], ea: [0, 1] }),
      props: [["wall", 62]],
      hold: true,
    },
    "cool.breathing": {
      a: {
        p: [110, 140],
        s: [146, 140],
        h: [168, 138],
        f: [86, 148],
        F: [90, 148],
        ka: [0, -1],
        KA: [0, -1],
        w: [128, 128],
        W: [124, 130],
        ea: [0, -1],
      },
      arrow: [
        [128, 116],
        [128, 96],
      ],
      hold: true,
    },
    "cool.easy_cool_down_jog": {
      a: WALK_A,
      b: WALK_B,
      arrow: [
        [176, 140],
        [200, 140],
      ],
    },
    /* running and machines */
    "cond.sprints": {
      a: SPR_A,
      b: SPR_B,
      arrow: [
        [172, 140],
        [212, 140],
      ],
    },
    "cond.strides": {
      a: RUN_A,
      b: SPR_B,
      arrow: [
        [172, 140],
        [212, 140],
      ],
    },
    "cond.hill_sprints": {
      a: skShift(SPR_A, 0, -9),
      b: skShift(SPR_B, 0, -9),
      props: [["hill"]],
      arrow: [
        [168, 104],
        [204, 92],
      ],
    },
    "cond.treadmill_intervals": {
      a: skShift(RUN_A, -6, -8),
      b: skShift(RUN_B, -6, -8),
      props: TREAD,
    },
    "cond.bike_sprints": {
      a: BIKE_A,
      b: { ...BIKE_A, f: [106, 119], F: [118, 136] },
      props: BIKE,
    },
    "cond.rowing_machine_intervals": {
      a: {
        p: [118, 128],
        s: [138, 96],
        h: [152, 74],
        f: [152, 136],
        F: [150, 136],
        ka: [0, -1],
        KA: [0, -1],
        w: [168, 114],
        W: [166, 112],
        ea: [0, 1],
      },
      b: {
        p: [98, 128],
        s: [90, 96],
        h: [84, 72],
        f: [152, 136],
        F: [150, 136],
        ka: [0, -1],
        KA: [0, -1],
        w: [106, 106],
        W: [104, 104],
        ea: [-1, 0.5],
      },
      props: [...ROWER, ["line", [206, 120], [168, 114], 2]],
      pb: [...ROWER, ["line", [206, 120], [106, 106], 2]],
      arrow: [
        [100, 24],
        [70, 24],
      ],
    },
    /* solo hardening (keyed by the German hardening name) */
    "Faust-Liegestütze": SKETCH.Liegestütze,
    "Faust-Stütz": { a: { ...pu, w: [119, 147], ea: [-1, 0] }, hold: true },
    "Handtuch auswringen": {
      a: st({ w: [144, 80], W: [140, 76], ea: [0, 1], EA: [0, 1] }),
      props: [["towel", [130, 80], [168, 76]]],
      arc: [[150, 78], 20, -150, 150],
      hold: true,
    },
    "Rumpf an den Sack": {
      a: st({
        h: [124, 38],
        s: [124, 62],
        p: [118, 96],
        w: [150, 70],
        W: [146, 74],
        ea: [0, 1],
        f: [112, 148],
        F: [104, 148],
      }),
      props: [
        ["cable", [168, 2], [168, 24]],
        ["rect", [150, 24], [36, 100]],
      ],
      arrow: [
        [200, 74],
        [186, 74],
      ],
      hold: true,
    },
    "Schienbeine abklopfen": {
      a: {
        p: [96, 140],
        s: [100, 106],
        h: [104, 82],
        f: [150, 146],
        F: [146, 146],
        ka: [0, -1],
        KA: [0, -1],
        w: [132, 112],
        W: [128, 116],
        ea: [0, 1],
      },
      b: {
        p: [96, 140],
        s: [100, 106],
        h: [106, 82],
        f: [150, 146],
        F: [146, 146],
        ka: [0, -1],
        KA: [0, -1],
        w: [140, 128],
        W: [128, 116],
        ea: [0, 1],
      },
      arrow: [
        [160, 100],
        [150, 120],
      ],
    },
  });
  /* top view for self-defence in the circle */
  function sdCircleSvg() {
    let h = `<svg class="sketch" viewBox="0 0 240 156" role="img"><defs><marker id="skHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${SK.BRASS}"/></marker></defs><circle cx="120" cy="78" r="58" fill="none" stroke="#2b2f36" stroke-width="2" stroke-dasharray="5 6"/>`;
    [0, 72, 144, 216, 288].forEach((a) => {
      const r = (a * Math.PI) / 180,
        x = 120 + Math.cos(r) * 58,
        y = 78 + Math.sin(r) * 58;
      h += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="13" ry="9" transform="rotate(${a + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${SD_PAL.near}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="${SD_PAL.far}"/>`;
    });
    h += `<ellipse cx="120" cy="78" rx="15" ry="10" fill="${SK.W}"/><circle cx="120" cy="78" r="7.5" fill="#d9d4cc"/>`;
    h += skArrow([136, 66], [156, 48]) + skArrow([108, 92], [92, 108]);
    return h + `</svg>`;
  }
  function sdSketchSvg(id) {
    if (id === "4.sd.1" || id === "5.sd.1") return sdCircleSvg();
    const k = SDSK[id];
    if (!k) return "";
    const props = k.props || [];
    let h = `<svg class="sketch" viewBox="0 0 240 156" role="img"><defs><marker id="skHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${SK.BRASS}"/></marker></defs>${skProp(["floor"])}`;
    k.parts.forEach(([who, q, only]) => (h += skFigure(q, who === "a" ? SD_PAL : null, only)));
    h += props.map(skProp).join("");
    return h + (k.arrow ? skArrow(...k.arrow) : "") + `</svg>`;
  }
  /* Release suggestions per self-defence item (exam id): [DE steps, EN steps]. Common teaching practice – the club's own solution has priority. */
  const SDTIPS = {
    "1.sd.0": [
      [
        "Kinn senken, Schultern hochziehen – das schützt den Hals.",
        "Schritt schräg zurück, einen Arm gestreckt nach oben reißen.",
        "Kräftig zur Seite dieses Arms drehen: Die Schulter drückt über die Arme des Angreifers, der Griff geht auf.",
        "Aus der Drehung sofort kontern (Ellbogen oder hintere Gerade), dann Distanz und Deckung.",
      ],
      [
        "Lower the chin, raise the shoulders – this protects the throat.",
        "Step back at an angle and throw one arm straight up.",
        "Turn hard to the side of that arm: the shoulder rolls over the attacker's arms and breaks the grip.",
        "Counter straight out of the turn (elbow or rear straight), then distance and guard.",
      ],
    ],
    "1.sd.1": [
      [
        "Kinn senken, mit beiden Händen kurz an den Fingern ziehen, um Luft zu bekommen.",
        "Einen Arm gestreckt nach oben reißen.",
        "Zum Angreifer hin drehen – der Arm wickelt über seine Arme und löst den Griff.",
        "Ellbogen oder Haken zum Körper, dann Distanz schaffen.",
      ],
      [
        "Lower the chin, pull at the fingers with both hands for air.",
        "Throw one arm straight up.",
        "Turn towards the attacker – the arm wraps over his arms and breaks the grip.",
        "Elbow or hook to the body, then create distance.",
      ],
    ],
    "1.sd.2": [
      [
        "Kinn zur Schulter, die Schulter auf der Angreiferseite hochziehen.",
        "Den Arm zum Angreifer hin gestreckt nach oben reißen.",
        "Zum Angreifer drehen, der Arm drückt seine Arme vom Hals weg.",
        "Ellbogen oder Faustschlag zum Körper, dann weg.",
      ],
      [
        "Chin to the shoulder, raise the shoulder on the attacker's side.",
        "Throw the arm nearest the attacker straight up.",
        "Turn into the attacker; the arm drives his arms off the neck.",
        "Elbow or punch to the body, then get away.",
      ],
    ],
    "1.sd.3": [
      [
        "Mit beiden Händen die greifende Hand fest auf den Kopf drücken – das nimmt den Zug.",
        "Mit dem Zug gehen statt dagegen.",
        "Konter mit Tritt oder Knie zum Körper.",
        "Die Hand am Handgelenk nach unten abknicken, lösen, Distanz.",
      ],
      [
        "Press the grabbing hand onto your head with both hands – this takes the pull out.",
        "Go with the pull instead of against it.",
        "Counter with a kick or knee to the body.",
        "Bend the hand down at the wrist, release, distance.",
      ],
    ],
    "2.sd.0": [
      [
        "Kinn einziehen, Kopf zum Angreifer drehen, damit der Hals frei bleibt.",
        "Mit der nahen Hand in den Körper oder Unterleib schlagen.",
        "Die freie Hand greift über seine Schulter ins Gesicht und zieht den Kopf nach hinten.",
        "Kopf herausziehen, aufrichten, Konter und Distanz. Von vorne: am Unterarm ziehen, Schläge zum Körper, Kopf zur Seite herausdrehen.",
      ],
      [
        "Tuck the chin, turn the head towards the attacker to keep the throat free.",
        "Strike the body or groin with the near hand.",
        "Reach over his shoulder to his face with the free hand and pull his head back.",
        "Pull the head out, stand up, counter and distance. From the front: pull at the forearm, strikes to the body, twist the head out sideways.",
      ],
    ],
    "2.sd.1": [
      [
        "Kinn in die Armbeuge drücken, mit beiden Händen den Unterarm nach unten ziehen.",
        "Gewicht tief, Hüfte zur Seite schieben.",
        "Ellbogen nach hinten in den Körper, Ferse auf den Fuß.",
        "Unter dem Arm zur Ellbogenseite herausdrehen, Distanz.",
      ],
      [
        "Press the chin into the crook of the arm, pull the forearm down with both hands.",
        "Drop your weight, shift the hips to the side.",
        "Elbow back into the body, heel onto the foot.",
        "Turn out under the arm towards the elbow side, distance.",
      ],
    ],
    "2.sd.2": [
      [
        "Sofort die Ellbogen fest an den Körper pressen, damit der Griff nicht schließt.",
        "Gewicht tief, Kopf nicht nach vorne drücken lassen.",
        "Ferse auf den Fuß oder Schritt zur Seite, Ellbogen nach hinten.",
        "Nach unten aus dem Griff gleiten und herausdrehen, Distanz.",
      ],
      [
        "Clamp the elbows to the body at once so the hold can't close.",
        "Drop your weight, don't let the head be pushed forward.",
        "Heel onto the foot or step to the side, elbow back.",
        "Slide down out of the hold and turn out, distance.",
      ],
    ],
    "2.sd.3": [
      [
        "Hand öffnen, Ellbogen zum Angreifer bringen.",
        "Gegen den Daumen herausdrehen – das ist die schwächste Stelle des Griffs.",
        "Bei Griff mit beiden Händen: eigene Hand von oben greifen und nach oben herausreißen.",
        "Sofort Konter oder Distanz.",
      ],
      [
        "Open the hand, bring the elbow towards the attacker.",
        "Twist out against the thumb – the weakest point of the grip.",
        "Two-handed grip: grab your own hand from above and rip it out upwards.",
        "Counter or distance straight away.",
      ],
    ],
    "3.sd.0": [
      [
        "Hüfte zurück, Gewicht tief – nicht ausheben lassen.",
        "Die Hände sind frei: Handballen unter sein Kinn und den Kopf wegdrücken.",
        "Knie zum Körper.",
        "Aus der gelockerten Umklammerung lösen, Distanz. Von hinten: Gewicht tief, Ellbogen nach hinten, Ferse auf den Fuß, herausdrehen.",
      ],
      [
        "Hips back, weight low – don't get lifted.",
        "Your hands are free: heel of the hand under his chin, push the head away.",
        "Knee to the body.",
        "Break out of the loosened hug, distance. From behind: weight low, elbow back, heel onto the foot, turn out.",
      ],
    ],
    "3.sd.1": [
      [
        "Gewicht tief, Hüfte zur Seite oder zurück.",
        "Hände an seine Hüfte bringen und Raum schaffen.",
        "Knie oder Hammerfaust in den Unterleib.",
        "Arme nach außen sprengen, nach unten herausducken, Distanz. Von hinten genauso, mit Ferse auf den Fuß.",
      ],
      [
        "Weight low, hips to the side or back.",
        "Bring the hands to his hips and make space.",
        "Knee or hammer fist to the groin.",
        "Burst the arms outwards, duck out downwards, distance. Same from behind, plus heel onto the foot.",
      ],
    ],
    "3.sd.2": [
      [
        "Gewicht tief, Stand verbreitern.",
        "Ellbogen in seinen Körper.",
        "Mit der freien Hand Kopf oder Kinn wegdrücken.",
        "Herausdrehen, Distanz.",
      ],
      [
        "Weight low, widen the stance.",
        "Elbow into his body.",
        "Push his head or chin away with the free hand.",
        "Turn out, distance.",
      ],
    ],
    "4.sd.0": [
      [
        "Nach vorne in die Distanz gehen – nah an seine Hand, nie an die Stockspitze.",
        "Doppelblock mit beiden Unterarmen gegen seinen Arm, nicht gegen den Stock.",
        "Den Stockarm umklammern und kontrollieren, Knie oder Schläge zum Körper.",
        "Stock wegnehmen oder Distanz. Von innen und außen genauso, beim Stich seitlich aus der Linie und den Arm nach außen parieren.",
      ],
      [
        "Move forward into the range – close to his hand, never to the tip of the stick.",
        "Double block with both forearms against his arm, not the stick.",
        "Wrap and control the stick arm, knee or strikes to the body.",
        "Take the stick or create distance. Same from inside and outside; against a thrust, step off the line and parry the arm outwards.",
      ],
    ],
    "4.sd.1": [
      [
        "Ständig bewegen, nie stehen bleiben.",
        "Alle Angreifer im Blick halten, keinem länger den Rücken zeigen.",
        "Jeden Angriff kurz und klar lösen: abwehren, kontern, sofort weiter.",
        "Prüfer achten auf Übersicht und Kontrolle, nicht auf Härte.",
      ],
      [
        "Keep moving, never stand still.",
        "Keep all attackers in view, never turn your back for long.",
        "Solve each attack short and clean: defend, counter, move on.",
        "Examiners look for awareness and control, not hardness.",
      ],
    ],
    "5.sd.0": [
      [
        "Hände vorne, Distanz halten.",
        "Beim Stich seitlich aus der Linie, mit der Hand am Unterarm parieren.",
        "Messerarm mit beiden Händen kontrollieren, Klinge vom Körper weg.",
        "Konter mit Knie oder Tritt, Entwaffnen oder Distanz. Von oben, innen, außen: Doppelblock am Unterarm, dann Arm kontrollieren.",
      ],
      [
        "Hands up front, keep your distance.",
        "Against a thrust, step off the line and parry the forearm with your hand.",
        "Control the knife arm with both hands, blade away from you.",
        "Counter with knee or kick, disarm or create distance. Overhead, inside, outside: double block on the forearm, then control the arm.",
      ],
    ],
    "5.sd.1": [
      [
        "Ständig bewegen, nie stehen bleiben.",
        "Alle Angreifer im Blick halten, keinem länger den Rücken zeigen.",
        "Jeden Angriff kurz und klar lösen: abwehren, kontern, sofort weiter.",
        "Prüfer achten auf Übersicht und Kontrolle, nicht auf Härte.",
      ],
      [
        "Keep moving, never stand still.",
        "Keep all attackers in view, never turn your back for long.",
        "Solve each attack short and clean: defend, counter, move on.",
        "Examiners look for awareness and control, not hardness.",
      ],
    ],
    "6.sd.0": [
      [
        "Kinn runter, mit den Händen an seinen Unterarmen ziehen, um Luft zu bekommen.",
        "Einen seiner Arme mit deinem Arm klemmen, den Fuß auf derselben Seite neben seinem Fuß aufstellen.",
        "Hüfte explosiv hoch (Brücke) und über die geklemmte Seite rollen.",
        "Oben ankommen, aufstehen, Distanz.",
      ],
      [
        "Chin down, pull at his forearms with your hands for air.",
        "Trap one of his arms with yours, plant the foot on the same side next to his foot.",
        "Drive the hips up explosively (bridge) and roll over the trapped side.",
        "Come out on top, stand up, distance.",
      ],
    ],
    "6.sd.1": [
      [
        "Auf der Hüfte drehen, die Füße bleiben zum Angreifer.",
        "Ist er zu nah: Doppelblock mit den Unterarmen über dem Kopf.",
        "Tritt gegen Knie oder Schienbein seines vorderen Beins.",
        "Technisch aufstehen: eine Hand hinten aufstützen, Bein durchziehen, Deckung oben, Distanz.",
      ],
      [
        "Spin on the hip, keep the feet towards the attacker.",
        "If he's too close: double forearm block above the head.",
        "Kick his lead knee or shin.",
        "Technical stand-up: post one hand behind, pull the leg through, guard up, distance.",
      ],
    ],
    "6.sd.2": [
      [
        "Unterarme schützen den Kopf, Füße zum Angreifer.",
        "Den tretenden Fuß abfangen und festklammern oder sein Standbein treten.",
        "Ihn mit dem Bein aus dem Gleichgewicht bringen.",
        "Technisch aufstehen, Deckung oben, Distanz.",
      ],
      [
        "Forearms cover the head, feet towards the attacker.",
        "Catch and trap the kicking leg, or kick his standing leg.",
        "Use your legs to take his balance.",
        "Technical stand-up, guard up, distance.",
      ],
    ],
  };
  function sdInfoHtml(id) {
    const tp = SDTIPS[id],
      lg = S.profile.lang === "de" ? 0 : 1,
      sk = sdSketchSvg(id);
    return `${sk ? `<div class="skwrap">${sk}</div><span class="sub">${t("sdLegend")}</span>` : ""}<div class="lab">${t("sdSteps")}</div><ol class="cues">${tp[lg].map((c) => `<li>${esc(c)}</li>`).join("")}</ol><div class="note warn">${t("sdSafe")}</div><span class="sub">${t("sdNote")}</span>`;
  }
