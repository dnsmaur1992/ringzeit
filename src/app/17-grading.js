  /* ============ Belt grading: adult programme of the BFVKB / WAKO Deutschland grading rules (as of 20.01.2019) ============ */
  /* Belts in order; main stages (with their own programme) are every second belt from yellow to black */
  const BELTS = [
    ["Weiß", "White", ["#e9e6df"]],
    ["Gelb", "Yellow", ["#e8c33a"]],
    ["Gelb-Orange", "Yellow-orange", ["#e8c33a", "#e58a2e"]],
    ["Orange", "Orange", ["#e58a2e"]],
    ["Orange-Grün", "Orange-green", ["#e58a2e", "#4f9d5a"]],
    ["Grün", "Green", ["#4f9d5a"]],
    ["Grün-Blau", "Green-blue", ["#4f9d5a", "#3f74c4"]],
    ["Blau", "Blue", ["#3f74c4"]],
    ["Blau-Braun", "Blue-brown", ["#3f74c4", "#7b5236"]],
    ["Braun", "Brown", ["#7b5236"]],
    ["Braun-Schwarz", "Brown-black", ["#7b5236", "#111"]],
    ["Schwarz (1. DAN)", "Black (1st Dan)", ["#111"]],
  ];
  const stageBelt = (s) => 2 * s - 1;
  /* blocks: mv stance/footwork/shadow, hd hand techniques, hc hand combos, ft kicks, hf hand-kick combos,
     db double kicks, df defence combinations, ms model sparring, fa break-falls, sd self-defence, th theory */
  const EXAM_BLK = ["mv", "hd", "hc", "ft", "hf", "db", "df", "ms", "fa", "sd", "th"];
  const EXAM_NEED = {
    db: "partner",
    df: "partner",
    ms: "partner",
    sd: "partner",
    fa: "mat",
    th: "none",
  };
  const EXAM = {
    1: {
      prep: 6,
      mv: [
        ["Gehen in Kampfstellung (schreitend-gleitend)", "Walking in stance (step-slide)"],
        ["Beinarbeit federnd-gleitend", "Bouncing footwork"],
      ],
      hd: [
        ["Vordere Gerade (Jab)", "Lead straight (jab)"],
        ["Hintere Gerade (Punch)", "Rear straight (punch)"],
        ["Faustrückenschlag (Backfist)", "Backfist"],
      ],
      hc: [
        ["Jab – Punch", "Jab – punch"],
        ["Punch – Jab", "Punch – jab"],
        ["Jab – Punch – Jab", "Jab – punch – jab"],
        ["Backfist – Punch", "Backfist – punch"],
      ],
      ft: [
        ["Vorwärtstritt vorderes Bein", "Front kick, lead leg"],
        ["Vorwärtstritt hinteres Bein", "Front kick, rear leg"],
      ],
      hf: [
        ["Jab – Punch – Vorwärtstritt hinten", "Jab – punch – rear front kick"],
        ["Vorwärtstritt vorne – Jab – Punch – Jab", "Lead front kick – jab – punch – jab"],
        ["Jab – Punch – Jab – Vorwärtstritt vorne", "Jab – punch – jab – lead front kick"],
      ],
      df: [
        ["Abwehr + Konter gegen Jab", "Defence + counter vs jab"],
        ["Abwehr + Konter gegen Punch", "Defence + counter vs punch"],
        ["Abwehr + Konter gegen Backfist", "Defence + counter vs backfist"],
        ["Abwehr + Konter gegen Vorwärtstritt vorne", "Defence + counter vs lead front kick"],
        ["Abwehr + Konter gegen Vorwärtstritt hinten", "Defence + counter vs rear front kick"],
      ],
      fa: [["Rolle vorwärts und rückwärts", "Forward and backward roll"]],
      sd: [
        ["Würgen von vorne", "Choke from the front"],
        ["Würgen von hinten", "Choke from behind"],
        ["Würgen von der Seite", "Choke from the side"],
        ["Ohr und Haare fassen", "Ear and hair grab"],
      ],
      th: [["Notwehr", "Self-defence law"]],
    },
    2: {
      prep: 6,
      mv: [
        ["Übergänge schreitend-/federnd-gleitend", "Transitions step-slide / bouncing"],
        ["Schattenkickboxen in alle Richtungen", "Shadow kickboxing in all directions"],
      ],
      hd: [
        ["Vorderer Haken", "Lead hook"],
        ["Hinterer Haken", "Rear hook"],
      ],
      hc: [
        ["Jab – hinterer Haken", "Jab – rear hook"],
        ["Vorderer Haken – Punch", "Lead hook – punch"],
        ["Punch – vorderer Haken", "Punch – lead hook"],
        ["Vorderer Haken – hinterer Haken", "Lead hook – rear hook"],
        ["Hinterer Haken – vorderer Haken", "Rear hook – lead hook"],
      ],
      ft: [
        ["Halbkreistritt vorderes Bein", "Roundhouse kick, lead leg"],
        ["Halbkreistritt hinteres Bein", "Roundhouse kick, rear leg"],
      ],
      hf: [
        ["Jab – Punch – Halbkreistritt vorne", "Jab – punch – lead roundhouse"],
        ["Halbkreistritt vorne – Punch – vorderer Haken", "Lead roundhouse – punch – lead hook"],
        ["Jab – Punch – Halbkreistritt hinten", "Jab – punch – rear roundhouse"],
      ],
      df: [
        ["Abwehr + Konter gegen vorderen Haken", "Defence + counter vs lead hook"],
        ["Abwehr + Konter gegen hinteren Haken", "Defence + counter vs rear hook"],
        ["Abwehr + Konter gegen Halbkreistritt vorne", "Defence + counter vs lead roundhouse"],
        ["Abwehr + Konter gegen Halbkreistritt hinten", "Defence + counter vs rear roundhouse"],
      ],
      fa: [["Sturz vorwärts und rückwärts", "Forward and backward fall"]],
      sd: [
        ["Schwitzkasten von der Seite und von vorne", "Headlock from the side and front"],
        ["Unterarmwürgen von hinten", "Forearm choke from behind"],
        ["Nelson", "Nelson hold"],
        ["Handgelenk fassen und befreien", "Wrist grab and release"],
      ],
      th: [["Regelkunde Pointfighting", "Point fighting rules"]],
    },
    3: {
      prep: 6,
      mv: [["Schattenkickboxen mit Techniken der Stufen 1–3", "Shadow kickboxing with stages 1–3"]],
      hd: [
        ["Vorderer Aufwärtshaken", "Lead uppercut"],
        ["Hinterer Aufwärtshaken", "Rear uppercut"],
      ],
      hc: [
        ["Jab – hinterer Aufwärtshaken", "Jab – rear uppercut"],
        ["Vorderer Aufwärtshaken – hinterer Haken", "Lead uppercut – rear hook"],
        ["Hinterer Haken – vorderer Aufwärtshaken", "Rear hook – lead uppercut"],
        ["Vorderer Haken – hinterer Aufwärtshaken", "Lead hook – rear uppercut"],
        ["Hinterer Aufwärtshaken – vorderer Haken", "Rear uppercut – lead hook"],
        ["Hinterer Aufwärtshaken – Jab", "Rear uppercut – jab"],
      ],
      ft: [
        ["Seitwärtstritt vorderes Bein", "Side kick, lead leg"],
        ["Seitwärtstritt hinteres Bein", "Side kick, rear leg"],
        ["Seitwärtstritt aus der Drehung", "Spinning side kick"],
      ],
      hf: [
        ["Backfist – Seitwärtstritt vorne", "Backfist – lead side kick"],
        ["Seitwärtstritt vorne – Jab – Punch – Jab", "Lead side kick – jab – punch – jab"],
        ["Jab – Punch – Jab – Seitwärtstritt aus der Drehung", "Jab – punch – jab – spinning side kick"],
        ["Seitwärtstritt vorne – Seitwärtstritt aus der Drehung", "Lead side kick – spinning side kick"],
      ],
      df: [
        ["Abwehr + Konter gegen vorderen Aufwärtshaken", "Defence + counter vs lead uppercut"],
        ["Abwehr + Konter gegen hinteren Aufwärtshaken", "Defence + counter vs rear uppercut"],
        ["Abwehr + Konter gegen Seitwärtstritt vorne", "Defence + counter vs lead side kick"],
        ["Abwehr + Konter gegen Seitwärtstritt hinten", "Defence + counter vs rear side kick"],
        ["Abwehr + Konter gegen Seitwärtstritt aus der Drehung", "Defence + counter vs spinning side kick"],
      ],
      ms: [
        ["Modellsparring gegen alle Angriffe der Stufen 1–3", "Model sparring vs all attacks of stages 1–3"],
        ["Freies Sparring (kann gefordert werden)", "Free sparring (may be required)"],
      ],
      fa: [["Fallen seitlich links und rechts", "Side fall left and right"]],
      sd: [
        ["Umklammern unter den Armen (vorne und hinten)", "Bear hug under the arms (front and back)"],
        ["Umklammern über den Armen (vorne und hinten)", "Bear hug over the arms (front and back)"],
        ["Umklammern von der Seite", "Bear hug from the side"],
      ],
      th: [["Regelkunde Leicht- und Vollkontakt", "Light and full contact rules"]],
    },
    4: {
      prep: 6,
      mv: [["Schattenkickboxen mit Techniken der Stufen 1–4", "Shadow kickboxing with stages 1–4"]],
      hc: [
        ["Dublette: Jab – Jab", "Double: jab – jab"],
        ["Dublette: Jab – vorderer Haken", "Double: jab – lead hook"],
        ["Dublette: vorderer Aufwärtshaken – vorderer Haken", "Double: lead uppercut – lead hook"],
        ["Hinterer Aufwärtshaken – hinterer Haken – Jab (lösen)", "Rear uppercut – rear hook – jab (break away)"],
      ],
      ft: [
        ["Außenristtritt vorderes Bein", "Crescent kick, lead leg"],
        ["Außenristtritt hinteres Bein", "Crescent kick, rear leg"],
        ["Außenristtritt aus der Drehung", "Spinning crescent kick"],
        ["Axttritt vorderes Bein", "Axe kick, lead leg"],
        ["Axttritt hinteres Bein", "Axe kick, rear leg"],
      ],
      hf: [
        ["Axttritt vorne – Punch", "Lead axe kick – punch"],
        ["Axttritt hinten – Seitwärtstritt (gleiches Bein)", "Rear axe kick – side kick (same leg)"],
        ["Jab – Punch – Außenristtritt aus der Drehung", "Jab – punch – spinning crescent kick"],
      ],
      df: [
        ["Abwehr + Konter gegen Außenristtritt vorne", "Defence + counter vs lead crescent kick"],
        ["Abwehr + Konter gegen Außenristtritt hinten", "Defence + counter vs rear crescent kick"],
        ["Abwehr + Konter gegen Außenristtritt aus der Drehung", "Defence + counter vs spinning crescent kick"],
        ["Abwehr + Konter gegen Axttritt vorne", "Defence + counter vs lead axe kick"],
        ["Abwehr + Konter gegen Axttritt hinten", "Defence + counter vs rear axe kick"],
      ],
      ms: [["Modellsparring gegen alle Angriffe der Stufen 1–4", "Model sparring vs all attacks of stages 1–4"]],
      fa: [["Fallen über ein Hindernis (rückwärts)", "Backward fall over an obstacle"]],
      sd: [
        ["Stockangriff von oben, innen, außen und Stich", "Stick attack: overhead, inside, outside, thrust"],
        ["Selbstverteidigung im Kreis (mehrere Angreifer)", "Self-defence in the circle (several attackers)"],
      ],
      th: [
        ["Regelkunde Formen", "Forms rules"],
        ["Geschichte des Kickboxens", "History of kickboxing"],
      ],
    },
    5: {
      prep: 12,
      mv: [["Schattenkickboxen mit Techniken der Stufen 1–5", "Shadow kickboxing with stages 1–5"]],
      ft: [
        ["Fußfeger innen und außen", "Foot sweep inside and outside"],
        ["Hakentritt vorderes Bein", "Hook kick, lead leg"],
        ["Hakentritt hinteres Bein", "Hook kick, rear leg"],
        ["Hakentritt aus der Drehung", "Spinning hook kick"],
      ],
      hf: [
        ["Jab – Fußfeger innen", "Jab – inside sweep"],
        ["Jab – Punch – Fußfeger außen", "Jab – punch – outside sweep"],
        ["Jab – Punch – Hakentritt vorne", "Jab – punch – lead hook kick"],
        ["Jab – Punch – Hakentritt hinten", "Jab – punch – rear hook kick"],
        ["Jab – Punch – Jab – Hakentritt aus der Drehung", "Jab – punch – jab – spinning hook kick"],
      ],
      df: [
        ["Abwehr + Konter gegen Fußfeger innen und außen", "Defence + counter vs inside and outside sweep"],
        ["Abwehr + Konter gegen Hakentritt vorne", "Defence + counter vs lead hook kick"],
        ["Abwehr + Konter gegen Hakentritt hinten", "Defence + counter vs rear hook kick"],
        ["Abwehr + Konter gegen Hakentritt aus der Drehung", "Defence + counter vs spinning hook kick"],
      ],
      ms: [["Modellsparring gegen alle Angriffe der Stufen 1–5", "Model sparring vs all attacks of stages 1–5"]],
      fa: [["Fallschule als Vorführung", "Break-fall demonstration"]],
      sd: [
        ["Messerangriff von oben, innen, außen und Stich", "Knife attack: overhead, inside, outside, thrust"],
        ["Selbstverteidigung im Kreis (mehrere Angreifer)", "Self-defence in the circle (several attackers)"],
      ],
      th: [["Lehrbeispiel Technikvermittlung", "Teaching a technique"]],
    },
    6: {
      prep: 12,
      mv: [["Schattenkickboxen mit allen Stufen", "Shadow kickboxing with all stages"]],
      ft: [
        ["Vorwärtstritt im Sprung", "Jumping front kick"],
        ["Halbkreistritt im Sprung", "Jumping roundhouse kick"],
        ["Seitwärtstritt im Sprung", "Jumping side kick"],
        ["Hakentritt im Sprung", "Jumping hook kick"],
      ],
      db: [
        [
          "Vorwärtstritt – Halbkreistritt (gleiches Bein, ohne Absetzen)",
          "Front kick – roundhouse (same leg, no touch-down)",
        ],
        [
          "Halbkreistritt – Halbkreistritt (gleiches Bein, ohne Absetzen)",
          "Roundhouse – roundhouse (same leg, no touch-down)",
        ],
        [
          "Seitwärtstritt – Halbkreistritt (gleiches Bein, ohne Absetzen)",
          "Side kick – roundhouse (same leg, no touch-down)",
        ],
      ],
      df: [
        ["Abwehr + Konter gegen alle Techniken der Stufen 1–5", "Defence + counter vs all techniques of stages 1–5"],
      ],
      ms: [["Modellsparring gegen alle Angriffe der Stufen 1–5", "Model sparring vs all attacks of stages 1–5"]],
      fa: [["Fallschule als Vorführung", "Break-fall demonstration"]],
      sd: [
        ["Würgen am Boden", "Choke on the ground"],
        ["Schlag mit Stock (Verteidiger am Boden)", "Stick strike (defender on the ground)"],
        ["Tritt (Verteidiger am Boden)", "Kick (defender on the ground)"],
      ],
      th: [
        ["Theorie der Stufen 1–5", "Theory of stages 1–5"],
        ["Erste-Hilfe-Kurs (Tageslehrgang)", "First-aid course (one day)"],
        [
          "Drei Kickbox-Lehrgänge, davon ein Kampfrichterlehrgang",
          "Three kickboxing courses, one of them for referees",
        ],
      ],
    },
  };
  /* flat list: id "s.blk.i" → item */
  const EXAM_ITEMS = [];
  for (let s = 1; s <= 6; s++)
    EXAM_BLK.forEach((b) =>
      (EXAM[s][b] || []).forEach((x, i) => EXAM_ITEMS.push({ id: `${s}.${b}.${i}`, s, b, de: x[0], en: x[1] })),
    );
  const examItem = (id) => EXAM_ITEMS.find((x) => x.id === id);
  const beltIdx = () => Math.min(11, Math.max(0, +S.profile.belt || 0));
  /* next main stage after the current belt (white → 1 yellow, yellow-orange → 2 orange …); null after black */
  const targetStage = () => {
    const s = Math.floor((beltIdx() + 1) / 2) + 1;
    return s <= 6 ? s : null;
  };
  const gpState = (id) => (S.profile.gp || {})[id] || 0;
  const beltName = (i) => BELTS[i][S.profile.lang === "de" ? 0 : 1];
  function beltDot(i) {
    const c = BELTS[i][2];
    return `<i class="bdot" style="background:${c.length > 1 ? `linear-gradient(90deg,${c[0]} 50%,${c[1]} 50%)` : c[0]}"></i>`;
  }
  /* exam progress of the target stage: items marked "solid" / all practical items */
  function examProgress(s) {
    const its = EXAM_ITEMS.filter((x) => x.s === s);
    return { ok: its.filter((x) => gpState(x.id) === 2).length, n: its.length };
  }
  /* Drill items for a session in grading prep: weighted towards new and not yet solid items.
     Self-defence, defence and model sparring only with a partner; falls only in a hall (mats). */
  function examPick(n, loc, eq) {
    const s = targetStage();
    if (!s) return [];
    const partner = eq.includes("partner"),
      pool = EXAM_ITEMS.filter((x) => {
        const need = EXAM_NEED[x.b];
        if (x.s > s || need === "none") return false;
        if (need === "partner" && !partner) return false;
        if (need === "mat" && loc !== "gym") return false;
        return true;
      }),
      w = (x) => (x.s === s ? 3 : 1) * [3, 2, 0.4][gpState(x.id)] * (partner && EXAM_NEED[x.b] === "partner" ? 1.5 : 1),
      out = [];
    while (out.length < n && pool.length) {
      const tot = pool.reduce((a, x) => a + w(x), 0);
      let r = Math.random() * tot,
        k = 0;
      while (k < pool.length - 1 && (r -= w(pool[k])) > 0) k++;
      out.push({ kind: "exam", id: pool[k].id });
      pool.splice(k, 1);
    }
    const order = EXAM_BLK;
    return out.sort((a, b) => order.indexOf(examItem(a.id).b) - order.indexOf(examItem(b.id).b));
  }
  function examDrill(x, eq) {
    const D = t("exDrill"),
      where = eq.includes("partner") ? D.pad : eq.includes("bag") ? D.bag : D.air;
    if (x.b === "hd" || x.b === "ft") return D.tech(where);
    if (x.b === "hc" || x.b === "hf") return D.combo(where);
    return D[x.b] || "";
  }
  function examRow(x, n, eq, lbl = true) {
    const st = gpState(x.id),
      lg = S.profile.lang;
    return `<div class="ex"><span class="num">${pad(n + 1)}</span><div class="tx">${lbl ? `<span class="last">${t("exBlk")[x.b]}${x.s !== targetStage() ? ` · ${t("exStage")(x.s)}` : ""}</span><br>` : ""}${SDTIPS[x.id] || TH_TOPIC[x.id] ? `<button type="button" class="exn" ${SDTIPS[x.id] ? "data-sdinfo" : "data-th"}="${x.id}"><b>${esc(x[lg])}</b><span class="exi" aria-hidden="true">i</span></button>` : `<b>${esc(x[lg])}</b>`}${eq ? `<div>${esc(examDrill(x, eq))}</div>` : ""}</div><button type="button" class="gpst s${st}" data-gp="${x.id}" aria-label="${t("gpLbl")[st]}">${t("gpLbl")[st]}</button></div>`;
  }
  function renderExam() {
    const b = beltIdx(),
      s = targetStage(),
      lg = S.profile.lang;
    let h = `<div class="panel"><div class="field"><span class="lab">${t("beltNow")}</span><div class="chips">${BELTS.map((x, i) => `<button type="button" class="chip" data-belt="${i}" aria-pressed="${b === i}">${beltDot(i)}${esc(beltName(i))}</button>`).join("")}</div></div></div>`;
    if (!s) return h + `<div class="note">${t("examDan")}</div>`;
    const pr = examProgress(s),
      g = (S.profile.comps || [])
        .filter((c) => c.kind === "grade" && c.date >= iso(today()))
        .sort((a, c) => a.date.localeCompare(c.date))[0];
    h += `<div class="panel"><div class="field"><span class="lab">${t("examTarget")}</span><div class="bigbelt">${beltDot(stageBelt(s))}<b>${esc(beltName(stageBelt(s)))}</b><span class="sub">${t("exStage")(s)} · ${t("examPrep")(EXAM[s].prep)}</span></div>
 <div class="pbar"><span style="width:${Math.round((100 * pr.ok) / pr.n)}%"></span></div><span class="sub">${t("examProg")(pr.ok, pr.n)}</span>
 <span class="sub">${g ? t("examDate")(fmtDate(g.date)) : t("examNoDate")}</span></div></div>`;
    h += `<div class="note">${t("examHow")}</div>`;
    EXAM_BLK.forEach((bk) => {
      const its = EXAM_ITEMS.filter((x) => x.s === s && x.b === bk);
      if (!its.length) return;
      h += `<div class="block"><div class="bhead"><b>${t("exBlk")[bk]}</b><span>${EXAM_NEED[bk] === "partner" ? t("exNeedP") : EXAM_NEED[bk] === "mat" ? t("exNeedM") : ""}</span></div>${its.map((x, n) => examRow(x, n, null, false)).join("")}</div>`;
    });
    if (s > 1) {
      h += `<h2>${t("examEarlier")}</h2>`;
      for (let k = 1; k < s; k++) {
        const its = EXAM_ITEMS.filter((x) => x.s === k && x.b !== "th"),
          ok = its.filter((x) => gpState(x.id) === 2).length;
        h += `<details class="block"><summary class="bhead"><b>${beltDot(stageBelt(k))} ${esc(beltName(stageBelt(k)))}</b><span>${ok}/${its.length}</span></summary>${its.map((x, n) => examRow(x, n)).join("")}</details>`;
      }
    }
    h += `<p class="foot">${t("examSrc")}</p>`;
    return h;
  }

