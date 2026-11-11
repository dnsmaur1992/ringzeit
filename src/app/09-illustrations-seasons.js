  /* ============ Illustrations (original, drawn in code) ============ */
  /*
   * The two fighters are drawn in the style of the club trainer's own pictogram (used with permission):
   * round body, a separate round head, thick rounded limbs. Both fighters have the same build.
   * Figures are drawn facing right in a 200×200 box; the opponent is mirrored.
   */
  const FIG = { W: "#F2EEE7", G: "#C8404A", BG: "#111318" };
  const limb = (pts, w) =>
    `<polyline points="${pts.map((q) => q.join(",")).join(" ")}" fill="none" stroke="${FIG.W}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const glove = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${FIG.G}" stroke="${FIG.BG}" stroke-width="3"/>`;
  /* ============ Seasons: spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb, plus a few special days ============ */
  /* Other calendars come from the phone itself (Intl): Islamic (Umm al-Qura) and Hebrew – offline and always up to date */
  const calCache = new Map();
  function calParts(cal, opts, d) {
    const k = cal + d.getTime();
    if (calCache.has(k)) return calCache.get(k);
    let r = null;
    try {
      const p = new Intl.DateTimeFormat("en-u-ca-" + cal, opts).formatToParts(d),
        g = (t) => (p.find((x) => x.type === t) || {}).value;
      r = {
        d: +g("day"),
        m: g("month"),
        y: +String(g("year") || g("relatedYear") || "").replace(/\D/g, ""),
      };
    } catch (e) {}
    if (calCache.size > 500) calCache.clear();
    calCache.set(k, r);
    return r;
  }
  const hijri = (d) => {
    const r = calParts("islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }, d);
    return r && { d: r.d, m: +r.m, y: r.y };
  };
  /* day of Hanukkah (1–8) or 0: it starts on 25 Kislev */
  function hanukkahDay(d) {
    for (let k = 0; k < 8; k++) {
      const r = calParts("hebrew", { day: "numeric", month: "long" }, addDays(d, -k));
      if (r && r.d === 25 && /^Kislev/.test(r.m)) return k + 1;
    }
    return 0;
  }
  /* Easter Sunday (Gregorian computus) */
  function easterSun(y) {
    const a = y % 19,
      b = Math.floor(y / 100),
      c = y % 100,
      d = Math.floor(b / 4),
      e = b % 4,
      f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4),
      k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7,
      m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31),
      da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  }
  /* Diwali follows the Hindu lunisolar calendar – main day (Lakshmi Puja) per year; extend the list in time */
  const DIWALI = ["2026-11-08", "2027-10-29", "2028-10-17", "2029-11-05", "2030-10-26"];
  /* Holi (Rangwali Holi, the day of colours) – likewise from the Hindu calendar; extend the list in time */
  const HOLI = ["2027-03-22", "2028-03-11", "2029-03-01", "2030-03-20"];
  /* Lunar New Year: day 1–2 of the first month in the Chinese calendar (from the phone, like Hijri and Hebrew) */
  const lunarNY = (d) => {
    const r = calParts("chinese", { day: "numeric", month: "numeric" }, d);
    return !!r && r.m === "1" && r.d <= 2;
  };
  /* first Sunday of Advent: four Sundays before Christmas Day */
  function advent1(y) {
    const x = new Date(y, 11, 25);
    return addDays(x, -((x.getDay() || 7) + 21));
  }
  /* n-th weekday (0 = Sunday) of a month, e.g. Mother's Day = 2nd Sunday in May, harvest festival = 1st Sunday in October */
  function nthDow(y, mo, dow, n) {
    const f = new Date(y, mo - 1, 1);
    return addDays(f, ((dow - f.getDay() + 7) % 7) + (n - 1) * 7);
  }
  /* All feasts on a date: greetings plus the one motif drawn in the scene (in order of priority) */
  function feastsOn(d) {
    const m = d.getMonth() + 1,
      day = d.getDate(),
      ds = iso(d),
      F = t("feast"),
      out = [],
      add = (k, g) => out.push({ k, g }),
      ea = daysBetween(easterSun(d.getFullYear()), d),
      hj = hijri(d),
      hk = hanukkahDay(d),
      y = d.getFullYear(),
      adv = daysBetween(advent1(y), d),
      same = (x) => iso(x) === ds;
    if (hk) add("hanukkah", F.hanukkah(hk));
    if (hj && hj.m === 9) add("ramadan", F.ramadan);
    if (hj && hj.m === 10 && hj.d <= 3) add("eidfitr", F.eidfitr);
    if (hj && hj.m === 12 && hj.d >= 10 && hj.d <= 13) add("eidadha", F.eidadha);
    if (DIWALI.includes(ds)) add("diwali", F.diwali);
    if (ea === 0 || ea === 1) add("easter", F.easter);
    if (ea >= -52 && ea <= -47) add("karneval", F.karneval);
    if (m === 2 && day === 14) add("valentine", F.valentine);
    if (m === 3 && (day === 20 || day === 21)) add("nouruz", F.nouruz);
    if (m === 3 && day === 20) add("ostara", F.ostara);
    if (m === 12 && day === 31) add("newyear", F.newyear0);
    if (m === 1 && day === 1) add("newyear", F.newyear1);
    if (m === 12 && day >= 24 && day <= 26) add("christmas", F.christmas);
    if ((m === 12 && day >= 26) || (m === 1 && day === 1)) add("kwanzaa", F.kwanzaa);
    if (m === 10 && day === 31) add("halloween", F.halloween);
    if (m === 6 && day === 21) add("summer", F.summer);
    if (m === 12 && day === 21) add("winter", F.winter);
    // German customs and public days (10.11.2026), plus Lunar New Year and Holi
    if (m === 11 && day === 11) add("martin", F.martin);
    if (m === 12 && day === 6) add("nikolaus", F.nikolaus);
    if (adv >= 0 && adv <= 21 && adv % 7 === 0) add("adventsun", F.adventsun(adv / 7 + 1));
    if (m === 1 && day === 6) add("epiphany", F.epiphany);
    if (ea === 49 || ea === 50) add("pentecost", F.pentecost);
    if (ea === 39) add("ascension", F.ascension);
    if (same(nthDow(y, 10, 0, 1))) add("harvest", F.harvest);
    if (same(nthDow(y, 5, 0, 2))) add("mothers", F.mothers);
    if (m === 3 && day === 8) add("womens", F.womens);
    if (m === 5 && day === 1) add("mayday", F.mayday);
    if (m === 10 && day === 3) add("unity", F.unity);
    if (lunarNY(d)) add("lunar", F.lunar);
    if (HOLI.includes(ds)) add("holi", F.holi);
    return out;
  }
  /* motif keys that are drawn; the first matching one wins */
  const MOTIFS = [
    "hanukkah",
    "eidfitr",
    "eidadha",
    "ramadan",
    "diwali",
    "easter",
    "pentecost",
    "karneval",
    "valentine",
    "lunar",
    "holi",
    "nouruz",
    "newyear",
    "christmas",
    "nikolaus",
    "epiphany",
    "martin",
    "halloween",
    "harvest",
    "unity",
    "mayday",
    "mothers",
    "womens",
    "summer",
  ];
  const NO_SANTA = new Set(["hanukkah", "ramadan", "eidfitr", "eidadha", "diwali"]);
  function seasonNow() {
    const d = ui.seasonDate ? parse(ui.seasonDate) : today(),
      m = d.getMonth() + 1,
      day = d.getDate(),
      k = m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter",
      fe = feastsOn(d),
      has = (x) => fe.some((f) => f.k === x);
    const inAdvent = (m === 12 && day <= 24) || daysBetween(advent1(d.getFullYear()), d) >= 0;
    let ev = MOTIFS.find(has) || (inAdvent || m === 12 ? "advent" : null);
    // Christmas hat in December and up to Epiphany – but not on the days of other religions' feasts;
    // a woolly hat for the rest of the winter, a jester's cap at carnival
    const santa = (m === 12 || (m === 1 && day <= 6)) && !fe.some((f) => NO_SANTA.has(f.k));
    const hat = has("karneval") ? "jester" : santa ? "santa" : k === "winter" ? "beanie" : null;
    return {
      k,
      ev,
      hat,
      greet: [...new Set(fe.map((f) => f.g))],
      // lit Advent candles (1–4) from the first Sunday of Advent to Christmas Eve, else 0
      candles: inAdvent && (m < 12 || day <= 24) ? Math.min(4, Math.floor(daysBetween(advent1(d.getFullYear()), d) / 7) + 1) : 0,
    };
  }
  const seasonOn = () => !S.profile.seasonOff;
  /* Ramadan mode: asked once per Ramadan; lighter sessions, technique instead of hard conditioning */
  function ramadanOn(ds) {
    const f = S.profile.fast;
    if (!f || !f.on) return false;
    const h = hijri(ds ? parse(ds) : today());
    return !!h && h.m === 9 && h.y === f.y;
  }
  const season = () => (seasonOn() ? seasonNow() : null);
  let figN = 0;
  /* boxing corners: shirt and shorts in one colour with a white waistline (blue corner left, red corner right).
     Shirt = the whole body, shorts = the thighs and the part of the body below the waistline (a darker tone). */
  const BOX_BLUE = { top: "#2F6FD0", shorts: "#1F4FA3" },
    BOX_RED = { top: "#D2343F", shorts: "#A5232E" };
  function boxOutfit(o, c) {
    const b = o.body,
      n = (o.belly.match(/-?[\d.]+/g) || []).map(Number),
      id = "bo" + figN++;
    let legs = "";
    o.legs.forEach((l) => {
      const [h, k, f] = l,
        e = [k[0] + (f[0] - k[0]) * 0.22, k[1] + (f[1] - k[1]) * 0.22],
        pts = `${h.join(",")} ${k.join(",")} ${e.map((v) => v.toFixed(1)).join(",")}`;
      legs += `<polyline points="${pts}" fill="none" stroke="${FIG.BG}" stroke-width="35" stroke-linecap="butt" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${c.shorts}" stroke-width="29" stroke-linecap="butt" stroke-linejoin="round"/>`;
    });
    const below = n.length >= 6 ? `M${n[0]} ${n[1]} Q${n[2]} ${n[3]} ${n[4]} ${n[5]} L${n[4] + 20} ${n[5] + 60} L${n[0] - 20} ${n[1] + 60} Z` : `M${b.cx - 60} ${b.cy + b.ry * 0.4} H${b.cx + 60} V${b.cy + b.ry + 5} H${b.cx - 60} Z`;
    const body = `<clipPath id="${id}"><ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx - 2}" ry="${b.ry - 2}" transform="rotate(${b.rot} ${b.cx} ${b.cy})"/></clipPath><g clip-path="url(#${id})"><rect x="${b.cx - b.rx - 4}" y="${b.cy - b.ry - 4}" width="${b.rx * 2 + 8}" height="${b.ry * 2 + 8}" transform="rotate(${b.rot} ${b.cx} ${b.cy})" fill="${c.top}"/><path d="${below}" fill="${c.shorts}"/></g><path d="${o.belly}" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>`;
    return { legs, body };
  }
  /* taekwondo: white dobok (long trousers, V-neck) with the belt of the grade; a swimsuit never replaces it */
  const DOBOK = "#FEFEFC",
    SKIN = "#E3B48F"; // dobok pure white, head and fists in skin tone so the dobok stands out from the figure
  function tkdOutfit(o, belt) {
    const b = o.body,
      n = (o.belly.match(/-?[\d.]+/g) || []).map(Number),
      id = "td" + figN++;
    let legs = "";
    o.legs.forEach((l) => {
      const [h, k, f] = l,
        pts = `${h.join(",")} ${k.join(",")} ${f.join(",")}`;
      legs += `<polyline points="${pts}" fill="none" stroke="${FIG.BG}" stroke-width="35" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${DOBOK}" stroke-width="29" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#CFCFD9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
    });
    // belt along the belly line: dark outline, belt colour, tip colour on the first part of the curve
    let belly = "",
      knot = "";
    if (n.length >= 6) {
      const d = o.belly,
        kx = (n[0] + 2 * n[2] + n[4]) / 4,
        ky = (n[1] + 2 * n[3] + n[5]) / 4;
      belly = `<path d="${d}" fill="none" stroke="${FIG.BG}" stroke-width="11" stroke-linecap="butt"/><path d="${d}" fill="none" stroke="${belt.base}" stroke-width="7.5" stroke-linecap="butt"/>`;
      if (belt.half) belly += `<path d="${d}" pathLength="100" fill="none" stroke="${belt.tip}" stroke-width="7.5" stroke-dasharray="0 50 50"/>`;
      else if (belt.tip) belly += `<path d="${d}" fill="none" stroke="${belt.tip}" stroke-width="3.2" stroke-linecap="butt"/>`; // second colour: lengthwise stripe in the middle of the whole belt
      knot = `<path d="M${kx - 3} ${ky + 3} l-5 15 M${kx + 3} ${ky + 3} l6 14" stroke="${FIG.BG}" stroke-width="7" stroke-linecap="round"/><path d="M${kx - 3} ${ky + 3} l-5 15 M${kx + 3} ${ky + 3} l6 14" stroke="${belt.base}" stroke-width="4" stroke-linecap="round"/>${belt.tip && !belt.half ? `<path d="M${kx - 3} ${ky + 3} l-5 15 M${kx + 3} ${ky + 3} l6 14" stroke="${belt.tip}" stroke-width="1.6" stroke-linecap="butt"/>` : ""}<rect x="${kx - 5}" y="${ky - 5}" width="10" height="10" rx="2.5" fill="${belt.base}" stroke="${FIG.BG}" stroke-width="2.5"/>`;
    }
    const hx = o.head.x,
      hy = o.head.y,
      collar = `<path d="M${hx - 11} ${hy + 22} L${hx + 1} ${hy + 40} L${hx + 12} ${hy + 22}" fill="none" stroke="#3F3F4A" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M${hx + 1} ${hy + 40} L${hx + 4} ${hy + 62}" fill="none" stroke="#3F3F4A" stroke-width="3" stroke-linecap="round"/>`;
    const body = `<clipPath id="${id}"><ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx - 2}" ry="${b.ry - 2}" transform="rotate(${b.rot} ${b.cx} ${b.cy})"/></clipPath><g clip-path="url(#${id})"><rect x="${b.cx - b.rx - 4}" y="${b.cy - b.ry - 4}" width="${b.rx * 2 + 8}" height="${b.ry * 2 + 8}" fill="${DOBOK}"/></g>${collar}${belly}${knot}`;
    return { legs, body };
  }
  function hatSvg(kind, x, y) {
    if (kind === "jester")
      return `<path d="M${x - 20} ${y - 12} Q${x - 30} ${y - 40} ${x - 40} ${y - 30} Q${x - 22} ${y - 30} ${x - 12} ${y - 14} Z" fill="#2E86DE" stroke="${FIG.BG}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 12} ${y - 15} Q${x} ${y - 52} ${x + 10} ${y - 15} Z" fill="#FFD23F" stroke="${FIG.BG}" stroke-width="3" stroke-linejoin="round"/><path d="M${x + 12} ${y - 14} Q${x + 22} ${y - 30} ${x + 40} ${y - 30} Q${x + 30} ${y - 40} ${x + 20} ${y - 12} Z" fill="#E8445A" stroke="${FIG.BG}" stroke-width="3" stroke-linejoin="round"/><rect x="${x - 23}" y="${y - 19}" width="46" height="9" rx="4" fill="#58D68D" stroke="${FIG.BG}" stroke-width="3"/><circle cx="${x - 41}" cy="${y - 30}" r="4.5" fill="#FFD23F" stroke="${FIG.BG}" stroke-width="2"/><circle cx="${x}" cy="${y - 50}" r="4.5" fill="#E8445A" stroke="${FIG.BG}" stroke-width="2"/><circle cx="${x + 41}" cy="${y - 30}" r="4.5" fill="#2E86DE" stroke="${FIG.BG}" stroke-width="2"/>`;
    if (kind === "santa")
      return `<path d="M${x - 19} ${y - 13} L${x + 19} ${y - 13} Q${x + 21} ${y - 40} ${x + 2} ${y - 49} Q${x - 15} ${y - 51} ${x - 29} ${y - 31} Q${x - 21} ${y - 27} ${x - 19} ${y - 13} Z" fill="#D42F3A" stroke="${FIG.BG}" stroke-width="3.5" stroke-linejoin="round"/><rect x="${x - 23}" y="${y - 20}" width="46" height="11" rx="5.5" fill="#F7F4EE" stroke="${FIG.BG}" stroke-width="3"/><circle cx="${x - 29}" cy="${y - 31}" r="6.5" fill="#F7F4EE" stroke="${FIG.BG}" stroke-width="3"/>`;
    return `<path d="M${x - 21} ${y - 9} Q${x - 22} ${y - 38} ${x} ${y - 39} Q${x + 22} ${y - 38} ${x + 21} ${y - 9} Z" fill="#2F6FB0" stroke="${FIG.BG}" stroke-width="3.5"/><path d="M${x - 14} ${y - 30} h28 M${x - 18} ${y - 22} h36" stroke="#F7F4EE" stroke-width="3" stroke-linecap="round" opacity=".85"/><rect x="${x - 23}" y="${y - 15}" width="46" height="10" rx="4" fill="#24578C" stroke="${FIG.BG}" stroke-width="3"/><circle cx="${x}" cy="${y - 42}" r="7" fill="#F7F4EE" stroke="${FIG.BG}" stroke-width="3"/>`;
  }
  function figure(o, outfit) {
    let s = "";
    const dob = !!(outfit && outfit.dobok);
    const arm = (a) => {
      const e = a[a.length - 1],
        pl = a.map((q) => q.join(",")).join(" ");
      if (dob)
        // dobok sleeve: white with dark outline, bare fist
        s += `<polyline points="${pl}" fill="none" stroke="${FIG.BG}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pl}" fill="none" stroke="${DOBOK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${e[0]}" cy="${e[1]}" r="9.5" fill="${SKIN}" stroke="${FIG.BG}" stroke-width="3"/>`;
      else s += limb(a, 17) + glove(e[0], e[1]);
    };
    const se = season(),
      tr = outfit ? (outfit.dobok ? tkdOutfit(o, outfit.belt) : boxOutfit(o, outfit)) : null;
    o.back.forEach(arm);
    o.legs.forEach((l) => (s += limb(l, 23)));
    if (tr) s += tr.legs;
    const b = o.body;
    s += `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" transform="rotate(${b.rot} ${b.cx} ${b.cy})" fill="${dob ? DOBOK : FIG.W}" stroke="${FIG.BG}" stroke-width="4"/>`;
    s += `<path d="${o.belly}" fill="none" stroke="${FIG.BG}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (tr) s += tr.body;
    o.front.forEach(arm);
    s += `<circle cx="${o.head.x}" cy="${o.head.y}" r="21" fill="${dob ? SKIN : FIG.W}" stroke="${FIG.BG}" stroke-width="4"/>`;
    if (se && se.hat) s += hatSvg(se.hat, o.head.x, o.head.y);
    return s;
  }
  const FIGS = {
    kick: {
      back: [
        [
          [92, 82],
          [70, 70],
          [64, 52],
        ],
      ],
      legs: [
        [
          [96, 128],
          [88, 160],
          [78, 192],
        ],
        [
          [112, 118],
          [156, 92],
          [200, 62],
        ],
      ],
      body: { cx: 96, cy: 102, rx: 36, ry: 44, rot: -28 },
      belly: "M70 118 Q92 140 122 120",
      front: [
        [
          [104, 78],
          [118, 66],
          [112, 50],
        ],
      ],
      head: { x: 80, y: 52 },
    },
    guard: {
      back: [
        [
          [86, 84],
          [104, 74],
          [110, 54],
        ],
      ],
      legs: [
        [
          [88, 132],
          [74, 162],
          [62, 192],
        ],
        [
          [110, 132],
          [120, 162],
          [132, 192],
        ],
      ],
      body: { cx: 98, cy: 104, rx: 38, ry: 44, rot: 6 },
      belly: "M66 120 Q98 146 130 120",
      front: [
        [
          [108, 86],
          [128, 74],
          [124, 56],
        ],
      ],
      head: { x: 104, y: 48 },
    },
    jab: {
      back: [
        [
          [86, 86],
          [100, 74],
          [106, 56],
        ],
      ],
      legs: [
        [
          [88, 132],
          [70, 162],
          [56, 192],
        ],
        [
          [112, 132],
          [126, 162],
          [140, 192],
        ],
      ],
      body: { cx: 98, cy: 104, rx: 38, ry: 44, rot: 10 },
      belly: "M66 120 Q98 146 130 122",
      front: [
        [
          [112, 84],
          [150, 74],
          [182, 66],
        ],
      ],
      head: { x: 108, y: 48 },
    },
    slip: {
      back: [
        [
          [84, 94],
          [100, 84],
          [108, 66],
        ],
      ],
      legs: [
        [
          [86, 136],
          [70, 164],
          [58, 192],
        ],
        [
          [110, 136],
          [124, 164],
          [138, 192],
        ],
      ],
      body: { cx: 96, cy: 110, rx: 38, ry: 42, rot: -14 },
      belly: "M64 124 Q94 148 126 126",
      front: [
        [
          [104, 92],
          [124, 82],
          [122, 64],
        ],
      ],
      head: { x: 86, y: 60 },
    },
  };
  /* "kick" = kickboxing scene (high kick against a guard), "box" = boxing scene (jab against a slip) */
  /* outfit per fighter: boxing corners (true) or the dobok with the belt of the grade ({ tkd: belt }), see outfitFor */
  const cornerOf = (box, side) =>
    !box ? null : box === true ? (side === "L" ? BOX_BLUE : BOX_RED) : box.tkd ? { dobok: true, belt: box.tkd } : null;
  function fightPair(scene, y = 14, box = false) {
    const [a, b, xa, xb] = scene === "kick" ? ["kick", "guard", 34, 362] : ["jab", "slip", 50, 352];
    // boxing: blue corner left, red corner right
    return `<g transform="translate(${xb} ${y}) scale(-1 1)"><g class="bob" style="animation-delay:.4s">${figure(FIGS[b], cornerOf(box, "R"))}</g></g><g transform="translate(${xa} ${y})"><g class="bob">${figure(FIGS[a], cornerOf(box, "L"))}</g></g>`;
  }
  let seed = 7;
  const srand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  /* light by time of day: dawn, day, dusk, night */
  function todSky() {
    const h = new Date().getHours();
    if (h >= 5 && h < 10) return { top: "#2b1d15", glow: "#E0914A", stars: 0, sun: 1 };
    if (h >= 10 && h < 17) return { top: "#19212c", glow: "#C9A86A", stars: 0 };
    if (h >= 17 && h < 21) return { top: "#2a1626", glow: "#D9705C", stars: 10 };
    return { top: "#14161B", glow: "#C9A86A", stars: 28, moon: 1 };
  }
  const TYPE_HEX = {
    T: "#d9545c",
    C: "#e0914a",
    P: "#e5683c",
    S: "#c9a86a",
    K: "#5fb3a6",
    M: "#8ec9a4",
    V: "#6f9fe0",
  };
  /* the front-most point of an attacking pose (where the blow lands) */
  function strikePoint(o) {
    let best = [0, 0];
    [...o.front, ...o.legs].forEach((l) => l.forEach((p) => p[0] > best[0] && (best = p)));
    return best;
  }
  /* two fighters trading: the attacker strikes every few seconds, the defender slips or takes it on the guard */
  function fightPairLive(scene, calm, y = 14, box = false) {
    // boxing: blue corner left, red corner right (only when the shown session is a boxing session)
    const L = cornerOf(box, "L"),
      R = cornerOf(box, "R");
    if (calm)
      return `<g transform="translate(362 ${y}) scale(-1 1)"><g class="bob" style="animation-delay:.4s">${figure(FIGS.guard, R)}</g></g><g transform="translate(40 ${y})"><g class="bob">${figure(FIGS.guard, L)}</g></g>`;
    const kick = scene === "kick",
      atk = kick ? "kick" : "jab",
      xa = kick ? 34 : 50,
      xb = kick ? 362 : 352,
      hp = strikePoint(FIGS[atk]),
      hx = xa + hp[0] + (kick ? 4 : 6),
      hy = y + hp[1],
      rays = [0, 60, 120, 180, 240, 300]
        .map((a) => {
          const r = (a * Math.PI) / 180;
          return `<line x1="${(Math.cos(r) * 9).toFixed(1)}" y1="${(Math.sin(r) * 9).toFixed(1)}" x2="${(Math.cos(r) * 17).toFixed(1)}" y2="${(Math.sin(r) * 17).toFixed(1)}"/>`;
        })
        .join("");
    const def = kick
      ? `<g class="kb">${figure(FIGS.guard, R)}</g>`
      : `<g class="pa">${figure(FIGS.guard, R)}</g><g class="pb">${figure(FIGS.slip, R)}</g>`;
    return `<g transform="translate(${xb} ${y}) scale(-1 1)"><g class="bob def" style="animation-delay:.4s">${def}</g></g><g transform="translate(${xa} ${y})"><g class="bob"><g class="pa">${figure(FIGS.guard, L)}</g><g class="pb">${figure(FIGS[atk], L)}</g></g></g><g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})"><g class="hitfx" stroke="#F3EEE4" stroke-width="3" stroke-linecap="round"><circle r="5" fill="#F3EEE4" stroke="none"/>${rays}</g></g>`;
  }
  function heroScene(pose, ty, calm, box = false) {
    seed = 11;
    const sky = todSky(),
      floorC = TYPE_HEX[ty] || "#C9A86A";
    let stars = "",
      dust = "";
    for (let i = 0; i < 28; i++) {
      const x = srand() * 400,
        y = srand() * 120,
        r = 0.4 + srand() * 0.9;
      const sc = `<circle class="${i % 3 ? "" : "tw"}" style="animation-delay:${(srand() * 3).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#ECE8E1" opacity="${(0.2 + srand() * 0.5).toFixed(2)}"/>`;
      if (i < sky.stars) stars += sc;
    }
    const se = season();
    // seasonal particles: petals, leaves or snow fall through the scene; in summer (and with the design off) dust floats in the light
    const pk = se ? (se.ev === "valentine" ? "hearts" : se.ev === "karneval" ? "confetti" : se.ev === "holi" ? "holi" : se.k) : null;
    if (pk && pk !== "summer") {
      const N = pk === "winter" ? 34 : pk === "confetti" || pk === "holi" ? 40 : 16,
        cols = {
          spring: ["#F48FB1", "#F8BBD0", "#FFFFFF"],
          autumn: ["#E0914A", "#C8404A", "#D9A441"],
          winter: ["#FFFFFF"],
          hearts: ["#FF5A7A", "#FF8FA3", "#E8445A"],
          confetti: ["#FF5A5F", "#FFD23F", "#58D68D", "#5DADE2", "#C77DFF"],
          holi: ["#FF3CAC", "#FFD23F", "#2ED573", "#1E90FF", "#FF6B35", "#A55EEA"],
        }[pk];
      for (let i = 0; i < N; i++) {
        const x = srand() * 420 - 10,
          col = cols[i % cols.length],
          dur = (se.k === "winter" ? 7 : 9) + srand() * 6,
          sh =
            pk === "hearts"
              ? `<path d="M0 4 C-7 -1 -4 -8 0 -3.5 C4 -8 7 -1 0 4Z" fill="${col}" opacity=".95"/>`
              : pk === "confetti"
                ? `<rect x="-2.5" y="-1.5" width="5" height="3" fill="${col}"/>`
                : pk === "holi"
                  ? `<circle r="${(1.8 + srand() * 2.4).toFixed(2)}" fill="${col}" opacity=".9"/>`
                : pk === "winter"
                  ? `<circle r="${(0.8 + srand() * 1.6).toFixed(2)}" fill="${col}" opacity="${(0.5 + srand() * 0.5).toFixed(2)}"/>`
                  : se.k === "spring"
                    ? `<ellipse rx="3.6" ry="2.3" fill="${col}" opacity=".95"/>`
                    : `<path d="M0 -6.5 Q5 0 0 6.5 Q-5 0 0 -6.5Z M0 -6.5 V6.5" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width=".8" opacity=".95"/>`;
        dust += `<g transform="translate(${x.toFixed(1)} -8)"><g class="fall" style="animation-duration:${dur.toFixed(1)}s;animation-delay:-${(srand() * dur).toFixed(1)}s;--dx:${((srand() - 0.5) * 60).toFixed(0)}px;--rot:${(srand() * 540 - 270).toFixed(0)}deg">${sh}</g></g>`;
      }
    }
    for (let i = 0; i < (pk && pk !== "summer" ? 0 : 12); i++) {
      const yy = 60 + srand() * 140,
        x = 200 + (srand() - 0.5) * (60 + yy * 0.9);
      dust += `<circle class="dust" style="animation-duration:${(5 + srand() * 5).toFixed(1)}s;animation-delay:-${(srand() * 8).toFixed(1)}s;--o:${(0.25 + srand() * 0.45).toFixed(2)}" cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${(0.6 + srand() * 1.1).toFixed(2)}" fill="#F3EEE4"/>`;
    }
    const se2 = season(),
      tint = se2
        ? {
            spring: "#8ec9a4",
            summer: "#F2B36B",
            autumn: "#E0914A",
            winter: "#9FB8D9",
          }[se2.k]
        : null;
    let extra = "";
    const ev = se2 && se2.ev;
    // summer: a palm tree in the background (taller than the fighters) on the left, a striped deckchair on the right
    if (se2 && se2.k === "summer") {
      const fronds = [
        "M80 40 Q112 22 146 44 Q114 34 80 46Z",
        "M80 40 Q118 44 136 78 Q110 52 80 46Z",
        "M80 40 Q48 20 14 40 Q46 32 80 46Z",
        "M80 40 Q42 44 26 78 Q52 52 80 46Z",
        "M80 40 Q86 14 112 10 Q92 22 82 44Z",
        "M80 40 Q66 16 40 14 Q62 24 78 44Z",
      ];
      let rings = "";
      for (let i = 0; i < 9; i++) {
        const t = i / 9,
          x = 58 + (80 - 58) * t * t + Math.sin(t * 3) * 4,
          y = 206 - (206 - 48) * t;
        rings += `<path d="M${(x - 5).toFixed(1)} ${y.toFixed(1)} q5 -3 10 0" stroke="#6B4A2E" stroke-width="1.6" fill="none"/>`;
      }
      extra += `<g class="palm"><path d="M56 208 Q50 156 64 106 Q72 72 80 44" stroke="#8B5E3C" stroke-width="11" fill="none" stroke-linecap="round"/>${rings}${fronds.map((d) => `<path d="${d}" fill="#2E8B57" stroke="#1E5E3B" stroke-width="1.5" stroke-linejoin="round"/>`).join("")}<circle cx="76" cy="48" r="5" fill="#7A5230"/><circle cx="85" cy="49" r="5" fill="#6B4A2E"/></g>`;
      extra += `<g class="deckchair"><path d="M332 208 L356 150 M370 208 L344 176" stroke="#C9A86A" stroke-width="4" stroke-linecap="round"/><path d="M354 156 L338 194 L378 200" fill="none" stroke="#FF7A59" stroke-width="11" stroke-linejoin="round"/><path d="M354 156 L338 194 L378 200" fill="none" stroke="#FFF4E0" stroke-width="11" stroke-dasharray="5 5" stroke-linejoin="round"/><path d="M326 184 L374 184 M378 200 L384 208" stroke="#C9A86A" stroke-width="4" stroke-linecap="round"/></g>`;
    }
    // lanterns for Ramadan and Eid (with stars at Eid)
    const lanterns = () => {
      let h = `<g transform="translate(330 40)"><circle r="16" fill="#F6E7B0"/><circle cx="7" cy="-5" r="15" fill="url(#sky)"/></g>`;
      [
        [70, 34],
        [118, 22],
        [282, 26],
      ].forEach(([x, l], i) => {
        h += `<line x1="${x}" y1="0" x2="${x}" y2="${l}" stroke="#6b5a35" stroke-width="1.5"/><g class="bulb" style="animation-delay:${i * 0.6}s"><path d="M${x - 7} ${l + 4} h14 l-3 18 h-8z" fill="#E0A63A" stroke="#7a5418" stroke-width="1.5"/><rect x="${x - 4}" y="${l + 8}" width="8" height="10" rx="2" fill="#FFE7A3"/><path d="M${x - 5} ${l + 4} l5 -5 l5 5z" fill="#7a5418"/></g>`;
      });
      return h;
    };
    if (ev === "ramadan") extra += lanterns();
    else if (ev === "eidfitr" || ev === "eidadha") {
      extra += lanterns();
      [
        [40, 70],
        [170, 40],
        [236, 60],
        [370, 92],
      ].forEach(([x, y], i) => {
        extra += `<path class="bulb" style="animation-delay:${i * 0.4}s" d="M${x} ${y - 6} l1.8 4.2 l4.2 1.8 l-4.2 1.8 l-1.8 4.2 l-1.8 -4.2 l-4.2 -1.8 l4.2 -1.8z" fill="#FFE7A3"/>`;
      });
    } else if (ev === "hanukkah") {
      // hanukkiah: eight candles plus the raised shamash in the middle; tonight's candles burn
      const n = hanukkahDay(ui.seasonDate ? parse(ui.seasonDate) : today());
      let c = `<g transform="translate(200 178)"><path d="M-40 0 h80 M0 0 v22 M-14 22 h28" stroke="#C9A86A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 9; i++) {
        const x = -40 + i * 10,
          sham = i === 4,
          y = sham ? -18 : -10,
          lit = sham || (i < 4 ? 8 - i : 9 - i) <= n;
        c += `<rect x="${x - 2}" y="${y}" width="4" height="${-y}" fill="#ECE8E1"/>`;
        if (lit) c += `<ellipse class="flame" cx="${x}" cy="${y - 4}" rx="2.2" ry="3.6" fill="#FFC94A"/>`;
      }
      extra += c + `</g>`;
    } else if (ev === "diwali") {
      // a row of diyas (clay lamps) on the floor
      for (let i = 0; i < 5; i++) {
        const x = 152 + i * 24;
        extra += `<g transform="translate(${x} 196)"><path d="M-9 0 Q0 9 9 0 Z" fill="#B5562A" stroke="#6E2F12" stroke-width="1.5"/><ellipse class="flame" cx="0" cy="-5" rx="2.4" ry="4.4" fill="#FFC94A"/><circle cx="0" cy="-4" r="9" fill="#FFC94A" opacity=".12"/></g>`;
      }
    } else if (ev === "easter") {
      // double size: the whole group scaled ×2 around the floor point (200, 207)
      extra += `<g transform="translate(200 207) scale(2) translate(-200 -207)">`;
      [
        [176, 200, "#F48FB1", "#FFFFFF"],
        [200, 196, "#5DADE2", "#FFD23F"],
        [224, 200, "#FFD23F", "#58D68D"],
      ].forEach(([x, y, a, b]) => {
        extra += `<g transform="translate(${x} ${y})"><ellipse rx="8" ry="10.5" fill="${a}" stroke="#111318" stroke-width="2"/><path d="M-7.5 -2 q3.75 3 7.5 0 t7.5 0" fill="none" stroke="${b}" stroke-width="2.4"/><path d="M-6 4 h12" stroke="${b}" stroke-width="2" stroke-dasharray="2 2"/></g>`;
      });
      extra += `<path d="M160 206 l4 -7 l3 7 l4 -8 l3 8 l4 -6 l3 6 M226 206 l4 -7 l3 7 l4 -8 l3 8" stroke="#58D68D" stroke-width="2" fill="none"/></g>`;
    } else if (ev === "nouruz") {
      // sabzeh: sprouted wheat in a bowl, tied with a red ribbon
      let blades = "";
      for (let i = 0; i < 13; i++) {
        const x = -14 + i * 2.3;
        blades += `<path d="M${x.toFixed(1)} 0 q${(Math.sin(i) * 3).toFixed(1)} -12 ${(Math.sin(i * 1.7) * 2).toFixed(1)} -${16 + (i % 3) * 3}" stroke="#58D68D" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      }
      extra += `<g transform="translate(200 192)">${blades}<path d="M-18 0 h36 l-5 12 h-26z" fill="#5DADE2" stroke="#111318" stroke-width="2"/><path d="M-17 4 h34" stroke="#E8445A" stroke-width="2.5"/></g>`;
    } else if (ev === "summer") {
      extra += `<circle cx="200" cy="206" r="60" fill="#FFB347" opacity=".18"/><circle cx="200" cy="214" r="24" fill="#FFB347" opacity=".45"/>`;
    }
    if (ev === "advent" || ev === "christmas" || ev === "nikolaus") {
      // string of lights across the top
      let bulbs = "";
      for (let i = 0; i <= 14; i++) {
        const x = 10 + i * 27.1,
          y = 12 + Math.sin((i / 14) * Math.PI) * 16;
        bulbs += `<circle class="bulb" style="animation-delay:${(i % 4) * 0.45}s" cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="3.6" fill="${["#FF5A5F", "#FFD23F", "#58D68D", "#5DADE2"][i % 4]}"/>`;
      }
      extra += `<path d="M10 12 Q200 44 390 12" fill="none" stroke="#2c3038" stroke-width="1.5"/>${bulbs}`;
    } else if (ev === "newyear") {
      [
        [80, 46, "#FFD23F", 0],
        [300, 38, "#FF5A5F", 0.7],
        [196, 26, "#5DADE2", 1.4],
      ].forEach(([x, y, c, dl]) => {
        let rays = "";
        for (let a = 0; a < 360; a += 30) {
          const r = (a * Math.PI) / 180;
          rays += `<line x1="${(Math.cos(r) * 6).toFixed(1)}" y1="${(Math.sin(r) * 6).toFixed(1)}" x2="${(Math.cos(r) * 24).toFixed(1)}" y2="${(Math.sin(r) * 24).toFixed(1)}"/>`;
        }
        extra += `<g transform="translate(${x} ${y})"><g class="fw" style="animation-delay:${dl}s" stroke="${c}" stroke-width="2.2" stroke-linecap="round">${rays}</g></g>`;
      });
    } else if (ev === "halloween") {
      // double size, standing on the floor
      extra += `<g transform="translate(200 203) scale(2) translate(0 -13)"><ellipse rx="17" ry="13" fill="#E8761F" stroke="#111318" stroke-width="2.5"/><path d="M-6 -12 Q0 -16 6 -12 M-9 -10 Q-12 0 -8 11 M9 -10 Q12 0 8 11" fill="none" stroke="#B85A12" stroke-width="2"/><path d="M0 -13 q1 -6 5 -8" stroke="#4E7A35" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-9 -3 l4 -4 l4 4z M1 -3 l4 -4 l4 4z" fill="#FFD23F"/><path d="M-8 4 q8 6 16 0 l-3 2 l-2 -2 l-3 2 l-3 -2 l-2 2z" fill="#FFD23F"/></g>`;
    }
    /* ---- feasts added 11.11.2026: each with its own movement ---- */
    const moon = sky.moon ? "" : `<g transform="translate(330 40)"><circle r="14" fill="#F6E7B0"/><circle cx="6" cy="-4" r="13" fill="url(#sky)"/></g>`;
    const star = (x, y, r, c, cls = "bulb", dl = 0) =>
      `<path class="${cls}" style="animation-delay:${dl}s" d="M${x} ${y - r} l${(r * 0.3).toFixed(1)} ${(r * 0.7).toFixed(1)} l${(r * 0.7).toFixed(1)} ${(r * 0.3).toFixed(1)} l${(-r * 0.7).toFixed(1)} ${(r * 0.3).toFixed(1)} l${(-r * 0.3).toFixed(1)} ${(r * 0.7).toFixed(1)} l${(-r * 0.3).toFixed(1)} ${(-r * 0.7).toFixed(1)} l${(-r * 0.7).toFixed(1)} ${(-r * 0.3).toFixed(1)} l${(r * 0.7).toFixed(1)} ${(-r * 0.3).toFixed(1)}z" fill="${c}"/>`;
    if (ev === "martin") {
      // St. Martin: a lantern procession walks slowly through the back of the scene, the lanterns sway on their sticks
      const cols = ["#FF8A3D", "#FFD23F", "#FF5A7A", "#7FD1FF", "#9CE37D"];
      let lz = "";
      cols.forEach((c, i) => {
        lz += `<g class="march" style="animation-delay:-${(i * 4.4).toFixed(1)}s;--mx:${48 + i * 76}px"><g class="sway" style="animation-delay:-${(i * 0.7).toFixed(1)}s"><path d="M-14 30 L0 -24 L7 -24" stroke="#8B6A3C" stroke-width="2" fill="none" stroke-linecap="round"/><line x1="7" y1="-24" x2="7" y2="-14" stroke="#6b5a35" stroke-width="1.2"/><circle cx="7" cy="-3" r="16" fill="${c}" opacity=".16"/><circle cx="7" cy="-3" r="9.5" fill="${c}" stroke="#3a2a14" stroke-width="1.4"/><path d="M-2 -7 h18 M-2 1 h18" stroke="#3a2a14" stroke-width=".8" opacity=".45"/><ellipse class="flame" cx="7" cy="-2" rx="2" ry="3.2" fill="#FFF3C4"/></g></g>`;
      });
      extra += moon + `<g transform="translate(0 146) scale(1.3)">${lz}</g>`;
    } else if (ev === "nikolaus") {
      // St. Nicholas: a filled boot by the ring, stars twinkle above it
      extra += `<g transform="translate(62 206)"><path d="M-12 0 h30 q7 0 7 -7 q0 -6 -9 -7 l-9 -1 v-19 h-19z" fill="#C8404A" stroke="#111318" stroke-width="2"/><rect x="-14" y="-38" width="23" height="8" rx="2.5" fill="#F2EEE7" stroke="#111318" stroke-width="1.5"/><circle cx="-6" cy="-42" r="5.5" fill="#F39C34" stroke="#111318" stroke-width="1.2"/><path d="M4 -38 v-12 q0 -5 5 -5 q5 0 5 5" stroke="#FFFFFF" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M4 -38 v-12 q0 -5 5 -5 q5 0 5 5" stroke="#E8445A" stroke-width="3.4" fill="none" stroke-dasharray="2 3" stroke-linecap="round"/><rect x="-2" y="-47" width="9" height="7" rx="1.5" fill="#58D68D" stroke="#111318" stroke-width="1.2"/></g>${star(40, 140, 6, "#FFE7A3", "bulb", 0)}${star(92, 126, 4.5, "#FFE7A3", "bulb", 0.6)}${star(70, 104, 5, "#FFE7A3", "bulb", 1.2)}`;
    } else if (ev === "epiphany") {
      // Epiphany: the star with its tail glides slowly across the sky
      extra += `<g class="comet"><path d="M0 0 L-120 -26 L-120 -18 Z" fill="#FFE7A3" opacity=".22"/><path d="M0 0 L-80 -14 L-80 -9 Z" fill="#FFE7A3" opacity=".35"/>${star(0, 0, 11, "#FFE7A3", "")}<circle r="20" fill="#FFE7A3" opacity=".12"/></g>${star(60, 90, 3.5, "#ECE8E1", "bulb", 0.3)}${star(350, 110, 3, "#ECE8E1", "bulb", 1.1)}`;
    } else if (ev === "pentecost") {
      // Pentecost: a white dove flies across, beating its wings
      extra += `<g transform="translate(0 64)"><g class="fly"><g transform="scale(1.4)"><ellipse cx="0" cy="0" rx="13" ry="6.5" fill="#F7F4EE" stroke="#111318" stroke-width="1.4"/><circle cx="11" cy="-4" r="4.6" fill="#F7F4EE" stroke="#111318" stroke-width="1.4"/><path d="M15 -4 l5 1.5 l-5 1.2z" fill="#F2B36B"/><circle cx="12" cy="-5" r=".9" fill="#111318"/><path d="M-12 0 l-9 -5 l2 7 z" fill="#F7F4EE" stroke="#111318" stroke-width="1.2"/><g class="flap"><path d="M-4 -3 Q2 -24 12 -22 Q6 -10 6 -3z" fill="#FFFFFF" stroke="#111318" stroke-width="1.3"/></g><path d="M18 -2 q4 -3 7 0" stroke="#58D68D" stroke-width="1.6" fill="none"/></g></g></g>`;
    } else if (ev === "harvest") {
      // harvest festival: a sheaf of wheat sways on the left, pumpkins and apples on the right
      let st = "";
      for (let i = 0; i < 11; i++) {
        const a = (i - 5) * 4.5;
        st += `<g transform="rotate(${a})"><path d="M0 0 V-46" stroke="#D9A441" stroke-width="2"/><ellipse cx="0" cy="-50" rx="3" ry="7" fill="#E8C16A" stroke="#9C7426" stroke-width="1"/></g>`;
      }
      extra += `<g transform="translate(58 206)"><g class="sway slow">${st}<rect x="-9" y="-24" width="18" height="6" rx="2" fill="#C8404A"/></g></g><g transform="translate(336 206)"><ellipse cx="0" cy="-10" rx="16" ry="11" fill="#E8761F" stroke="#111318" stroke-width="2"/><path d="M0 -21 q1 -5 4 -6" stroke="#4E7A35" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="26" cy="-7" rx="10" ry="7" fill="#F0A33A" stroke="#111318" stroke-width="2"/><circle cx="-24" cy="-6" r="6" fill="#C8404A" stroke="#111318" stroke-width="1.6"/><circle cx="-34" cy="-5" r="5" fill="#58D68D" stroke="#111318" stroke-width="1.6"/></g>`;
    } else if (ev === "unity") {
      // Day of German Unity: a string of pennants in black, red and gold waves across the top
      let pn = "";
      for (let i = 0; i < 13; i++) {
        const x = 18 + i * 28.5,
          y = 10 + Math.sin((i / 12) * Math.PI) * 18;
        pn += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="sway" style="animation-delay:-${((i % 5) * 0.3).toFixed(1)}s"><path d="M-9 0 h18 l-9 18z" fill="${["#1C1C1C", "#DD0000", "#FFCE00"][i % 3]}" stroke="#0A0B0D" stroke-width=".8"/></g></g>`;
      }
      extra += `<path d="M10 10 Q200 46 390 10" fill="none" stroke="#6b6f78" stroke-width="1.5"/>${pn}`;
    } else if (ev === "mayday") {
      // May Day: a maypole with a wreath and fluttering ribbons
      let rb = "";
      ["#FF5A5F", "#FFD23F", "#58D68D", "#5DADE2", "#C77DFF"].forEach((c, i) => {
        rb += `<g class="sway" style="animation-delay:-${(i * 0.35).toFixed(2)}s"><path d="M0 0 q${-14 + i * 7} 30 ${-22 + i * 11} 62" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
      });
      extra += `<g transform="translate(52 0)"><path d="M0 206 V36" stroke="#C9A86A" stroke-width="5" stroke-linecap="round"/><g transform="translate(0 44)">${rb}<ellipse rx="16" ry="5" fill="none" stroke="#3E8E4E" stroke-width="5"/><ellipse rx="16" ry="5" fill="none" stroke="#7FD18A" stroke-width="2" stroke-dasharray="3 4"/></g><path d="M0 36 l-5 -9 h10z" fill="#58D68D"/></g>`;
    } else if (ev === "mothers" || ev === "womens") {
      // Mother's Day: hearts rise; International Women's Day: tulips sway on both sides (and petals fall in spring)
      if (ev === "mothers") {
        seed = 51;
        for (let i = 0; i < 16; i++) {
          const x = 20 + srand() * 360,
            dur = 7 + srand() * 5;
          extra += `<g transform="translate(${x.toFixed(1)} 228)"><g class="floatup" style="animation-duration:${dur.toFixed(1)}s;animation-delay:-${(srand() * dur).toFixed(1)}s"><path transform="scale(${(1.4 + srand() * 0.8).toFixed(2)})" d="M0 5 C-8 -1 -5 -9 0 -4 C5 -9 8 -1 0 5Z" fill="${["#FF5A7A", "#FF8FA3", "#E8445A"][i % 3]}" stroke="#111318" stroke-width=".6"/></g></g>`;
        }
      }
      const tulips = (x, flip) => {
        let g = `<g transform="translate(${x} 208) scale(${flip ? -1.3 : 1.3} 1.3)">`;
        [
          [-8, 46, "#FF5A7A"],
          [2, 56, "#FFD23F"],
          [12, 44, "#C77DFF"],
        ].forEach(([dx, h, c], i) => {
          g += `<g class="sway" style="animation-delay:-${(i * 0.5).toFixed(1)}s"><path d="M${dx} 0 q${dx / 2} ${-h / 2} 0 ${-h}" stroke="#3E8E4E" stroke-width="2.4" fill="none"/><path d="M${dx - 6} ${-h} q0 -12 6 -12 q6 0 6 12 q-3 -4 -6 0 q-3 -4 -6 0z" fill="${c}" stroke="#111318" stroke-width="1.2"/></g>`;
        });
        return g + `<path d="M-4 -18 q-10 -6 -14 -14 q12 2 16 12z" fill="#58D68D"/></g>`;
      };
      if (ev === "womens") extra += tulips(54, false) + tulips(346, true);
    } else if (ev === "lunar") {
      // Lunar New Year: red lanterns with tassels, firecracker sparks
      [
        [64, 30],
        [116, 18],
        [286, 22],
        [338, 34],
      ].forEach(([x, l], i) => {
        extra += `<line x1="${x}" y1="0" x2="${x}" y2="${l}" stroke="#6b5a35" stroke-width="1.5"/><g class="sway" style="animation-delay:-${(i * 0.5).toFixed(1)}s"><g transform="translate(${x} ${l + 12})"><ellipse rx="13" ry="11" fill="#D63031" stroke="#7a1414" stroke-width="1.5"/><path d="M-6 -10 q-4 10 0 20 M6 -10 q4 10 0 20 M0 -11 v22" stroke="#7a1414" stroke-width="1" fill="none"/><rect x="-6" y="-14" width="12" height="4" rx="1" fill="#F2C14E"/><rect x="-6" y="10" width="12" height="4" rx="1" fill="#F2C14E"/><path d="M-2 14 v9 M0 14 v11 M2 14 v9" stroke="#F2C14E" stroke-width="1.2"/></g></g>`;
      });
      [
        [200, 34, "#F2C14E", 0],
        [160, 60, "#FF5A5F", 0.9],
      ].forEach(([x, y, c, dl]) => {
        let rays = "";
        for (let a = 0; a < 360; a += 36) {
          const r = (a * Math.PI) / 180;
          rays += `<line x1="${(Math.cos(r) * 4).toFixed(1)}" y1="${(Math.sin(r) * 4).toFixed(1)}" x2="${(Math.cos(r) * 16).toFixed(1)}" y2="${(Math.sin(r) * 16).toFixed(1)}"/>`;
        }
        extra += `<g transform="translate(${x} ${y})"><g class="fw" style="animation-delay:${dl}s" stroke="${c}" stroke-width="2" stroke-linecap="round">${rays}</g></g>`;
      });
    } else if (ev === "holi") {
      // Holi: clouds of colour puff up and fade, coloured powder drifts down
      [
        [70, 120, "#FF3CAC", 0],
        [330, 104, "#1E90FF", 0.8],
        [150, 70, "#FFD23F", 1.6],
        [260, 62, "#2ED573", 2.4],
        [200, 140, "#A55EEA", 3.2],
      ].forEach(([x, y, c, dl]) => {
        extra += `<g transform="translate(${x} ${y})"><g class="puff" style="animation-delay:${dl}s"><circle r="30" fill="${c}" opacity=".32"/><circle cx="-14" cy="6" r="18" fill="${c}" opacity=".38"/><circle cx="16" cy="-4" r="20" fill="${c}" opacity=".3"/></g></g>`;
      });
    }
    // Advent: a wreath on the floor with one more candle lit each Sunday (also on St. Nicholas' Day)
    if ((ev === "advent" || ev === "nikolaus") && se2.candles) {
      let w = `<g transform="translate(${ev === "nikolaus" ? 340 : 336} 200) scale(1.25)"><ellipse rx="34" ry="8" fill="#2E6B3F" stroke="#1E4A2B" stroke-width="2"/><ellipse rx="34" ry="8" fill="none" stroke="#58D68D" stroke-width="1.4" stroke-dasharray="2 5"/>`;
      [-21, -7, 7, 21].forEach((x, i) => {
        w += `<rect x="${x - 3}" y="-20" width="6" height="18" rx="1.5" fill="#C8404A" stroke="#7a1f25" stroke-width="1"/>`;
        if (i < se2.candles) w += `<ellipse class="flame" cx="${x}" cy="-25" rx="2.2" ry="3.8" fill="#FFC94A"/><circle cx="${x}" cy="-25" r="7" fill="#FFC94A" opacity=".14"/>`;
      });
      [-30, 0, 30].forEach((x) => (w += `<circle cx="${x}" cy="4" r="2.6" fill="#E8445A"/>`));
      extra += w + `</g>`;
    }
    const orb = sky.sun
      ? `<circle cx="70" cy="170" r="90" fill="url(#orb)"/>`
      : sky.moon
        ? `<circle cx="338" cy="38" r="11" fill="#ECE8E1" opacity=".75"/><circle cx="343" cy="34" r="10" fill="url(#sky)"/>`
        : "";
    return `<svg viewBox="0 0 400 220" role="img" aria-label="Ringzeit">
 <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="#0A0B0D"/></linearGradient>
 <radialGradient id="orb" cx="70" cy="170" r="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F2B36B" stop-opacity=".42"/><stop offset="1" stop-color="#F2B36B" stop-opacity="0"/></radialGradient>
 <radialGradient id="glow" cx="200" cy="120" r="170" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${sky.glow}" stop-opacity=".26"/><stop offset=".5" stop-color="${sky.glow}" stop-opacity=".07"/><stop offset="1" stop-color="${sky.glow}" stop-opacity="0"/></radialGradient>
 <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EEE4" stop-opacity=".16"/><stop offset="1" stop-color="#F3EEE4" stop-opacity="0"/></linearGradient>
 <radialGradient id="floor" cx="200" cy="208" r="150" gradientTransform="matrix(1 0 0 .16 0 174.7)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${floorC}" stop-opacity=".4"/><stop offset="1" stop-color="${floorC}" stop-opacity="0"/></radialGradient></defs>
 <rect width="400" height="220" fill="url(#sky)"/>${tint ? `<rect width="400" height="220" fill="${tint}" opacity=".07"/>` : ""}${orb}${stars}${extra}<rect class="glow" width="400" height="220" fill="url(#glow)"/>
 <polygon points="170,0 230,0 330,220 70,220" fill="url(#beam)"/>${dust}
 <ellipse cx="200" cy="208" rx="150" ry="24" fill="url(#floor)"/>
 ${fightPairLive(pose, calm, 14, box)}</svg>`;
  }
  function burst() {
    let s = "";
    for (let r = 40; r <= 150; r += 22)
      s += `<circle r="${r}" fill="none" stroke="#C9A86A" stroke-width=".5" opacity="${(0.5 - r / 400).toFixed(2)}"/>`;
    s += `<circle r="118" fill="none" stroke="#C9A86A" stroke-width="1" stroke-dasharray="2 10" opacity=".7"/>`;
    return s;
  }

