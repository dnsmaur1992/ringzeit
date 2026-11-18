  /* ============ Vorbereitung auf den Schwerpunkt (Betreiber 17.11.2026, E1, E12, E21–E26) ============
     Every unit with technique rounds (technique, technique & conditioning, sparring; all sports) ends its warm-up with a
     short preparation derived from the SAME focus as the main part: up to 45 min 2 parts × 45 s, longer 3 × 40 s, 5 s
     change between them – slow and one by one → linked → working pace. Solo, also with a partner. The 2 minutes come
     out of the general warm-up (it keeps at least 6), so the chosen duration stays. Order (18.11.2026): the focus on its own
     full page first, then this page with the parts and a timer with calls, then the main part; "Direkt los" starts the
     main part at once. It does not count for the Grundabdeckung – the fixed rounds stay. */
  const PREP_MIN = 2;
  /* Federn in the preparation (18.11.2026, Prüfauftrag Punkt 2): a structured share per part, never read from the text.
     The first part of the bounce focus ("bounce lightly, then steps …") and the Taekwondo stepping before the chamber
     count half of their time as Federzeit (Betreiber: "halber Teil"); everything else 0. The same share goes into the
     part (st.f), the dose line, the balance (plyoBudget) and the reservation at planning (prepFedPlan). */
  const PREP_FED_SHARE = 0.5;
  const prepParts = (min) => (min <= 45 ? 2 : 3);
  const prepSecs = (parts) => (parts === 2 ? 45 : 40);
  /* which template a focus gets – the same decision as in prepSteps, without the rounds */
  function prepKind(th, sp) {
    th = th || {};
    if (th.kinds === "foot" || th.kinds === "bounce" || th.id === "foot" || th.id === "bounce") return th.id === "bounce" || th.kinds === "bounce" ? "bounce" : "foot";
    // a Taekwondo kick focus may fall back to the kick template (no evade rounds) – reserved as such, on the safe side
    if (sp === "taekwondo" && th.kick) return "kick";
    if (th.kinds === "evade" || th.id === "def" || !!th.counters) return "def";
    return "other";
  }
  /* the Federzeit of the first part (the other parts have none) */
  const prepFedFirst = (kind, secs) => (kind === "bounce" || kind === "kick" ? Math.round(secs * PREP_FED_SHARE) : 0);
  /* planned before the rounds are built: the Federzeit a preparation of this unit will take (reserved in the budget) */
  function prepFedPlan(type, theme, min, sp) {
    if (!["T", "C", "P"].includes(type)) return 0;
    return prepFedFirst(prepKind(theme, sp), prepSecs(prepParts(min)));
  }
  /* the Federzeit of a built preparation item: from its parts (old units without the share count 0) */
  const prepFedOf = (it) => (it && it.steps ? it.steps.reduce((a, st) => a + (+st.f || 0) * (it.s || 0), 0) : 0);
  const PREP_TEMPO = {
    de: { slow: "Langsam und einzeln", link: "Verbunden", work: "Arbeitstempo" },
    en: { slow: "Slow, one by one", link: "Linked", work: "Working pace" },
  };
  /* the parts in both languages: { t: tempo key, de, en } */
  function prepSteps(s, parts) {
    const rb = roundBlock(s);
    if (!rb) return null;
    const th = focusOf(s.theme) || {},
      rounds = rb.items,
      ref = rounds.find((r) => r.combo && !r.evade && !r.ease && !r.six) || rounds.find((r) => r.combo && !r.evade),
      ev = rounds.find((r) => r.evade && r.combo),
      reactR = rounds.find((r) => r.react && (r.react.pre || r.react.mid || r.react.post)),
      sp = s.sport || buildSport,
      tkd = sp === "taekwondo",
      foot = th.kinds === "foot" || th.kinds === "bounce" || th.id === "foot" || th.id === "bounce",
      def = th.kinds === "evade" || th.id === "def" || !!th.counters,
      kick = tkd && th.kick ? th.kick : null;
    const prevLang = S.profile.lang;
    const both = (fn) => {
      const o = {};
      for (const lg of ["de", "en"]) {
        S.profile.lang = lg;
        o[lg] = fn(lg === "de");
      }
      S.profile.lang = prevLang;
      return o;
    };
    const names = (c) => c.map((x) => techNm(x)).join(", ");
    const c = ref && ref.combo ? ref.combo.slice(0, 4) : null;
    let tpl;
    if (foot) {
      const lead = tkd ? "ap" : "jab";
      tpl = [
        (de) => (th.id === "bounce" || th.kinds === "bounce" ? (de ? "In der Auslage locker federn, dann Schritte vor, zurück und seitlich – Füße nicht kreuzen." : "Bounce lightly in your stance, then steps forward, back and sideways – feet never crossing.") : de ? "Schritte vor, zurück und seitlich, einzeln – Füße nicht kreuzen, Deckung oben." : "Steps forward, back and sideways, one at a time – feet never crossing, guard up."),
        (de) => (de ? `Schritt hinein mit ${techNm(lead)}, sofort wieder heraus.` : `Step in with the ${techNm(lead)}, straight back out.`),
        (de) => (c ? (de ? `Schritte und ${names(c)}, danach in den Winkel heraus.` : `Steps and ${names(c)}, then out at an angle.`) : de ? "Schritte und Winkel im Wechsel, danach zurück in die Kampfstellung." : "Steps and angles in turn, then back into your stance."),
      ];
    } else if (def && (ev || reactR)) {
      const d = ev ? ev.evade.d : (reactR.react.pre || reactR.react.mid || reactR.react.post).d,
        cc = ev ? ev.combo.slice(0, 3) : c || [],
        dn = (de) => (DEFS[d] ? DEFS[d][de ? 0 : 1] : de ? "Abwehr" : "defence");
      tpl = [
        (de) => (de ? `${dn(de)} gegen einen gedachten Angriff, danach zurück in die Kampfstellung.` : `${dn(de)} against an imagined attack, then back into your stance.`),
        (de) => (cc.length ? (de ? `${dn(de)}, dann Konter: ${names(cc)}.` : `${dn(de)}, then counter: ${names(cc)}.`) : de ? `${dn(de)} im Wechsel links und rechts.` : `${dn(de)} left and right in turn.`),
        (de) => (de ? `${dn(de)}, Konter und sofort zurück in die Kampfstellung.` : `${dn(de)}, counter and straight back into your stance.`),
      ];
    } else if (kick) {
      tpl = [
        (de) => (de ? `Stepping im Rhythmus, dann das Knie in die Ausholstellung für ${techNm(kick)} heben und kurz halten.` : `Stepping in rhythm, then lift the knee into the chamber for ${techNm(kick)} and hold briefly.`),
        (de) => (de ? `${techNm(kick)} langsam, mit Rückkehr in die Stellung.` : `${techNm(kick)} slowly, back into your stance.`),
        (de) => (c ? names(c) + "." : techNm(kick) + "."),
      ];
    } else if (c) {
      tpl = [
        (de) => (de ? `Die Techniken einzeln: ${names(c)} – nach jeder zurück in die Kampfstellung.` : `The techniques one by one: ${names(c)} – back into your stance after each.`),
        (de) => (de ? `${names(c)} verbunden, kontrolliert.` : `${names(c)} linked, with control.`),
        (de) => (de ? `${names(c)}, danach heraus aus der Distanz.` : `${names(c)}, then out of range.`),
      ];
    } else {
      // sparring (tasks, no combos): stance, range and the rhythm of the bouts
      const lead = tkd ? "ap" : "jab";
      tpl = [
        (de) => (de ? "Kampfstellung: Schritte vor, zurück und seitlich, Deckung oben." : "Fighting stance: steps forward, back and sideways, guard up."),
        (de) => (de ? `Schritt hinein mit ${techNm(lead)}, heraus und in den Winkel.` : `Step in with the ${techNm(lead)}, out and to an angle.`),
        (de) => (de ? "Im Sparring-Rhythmus: angreifen, abwehren, heraus – locker." : "In sparring rhythm: attack, defend, get out – loose."),
      ];
    }
    // 2 parts: slow → working pace; 3 parts: slow → linked → working pace
    const pick = parts === 2 ? [0, 2] : [0, 1, 2],
      tempi = parts === 2 ? ["slow", "work"] : ["slow", "link", "work"],
      // the Federzeit share of a part: only the first one of the bounce focus and of the Taekwondo stepping
      kind = foot ? (th.id === "bounce" || th.kinds === "bounce" ? "bounce" : "foot") : def && (ev || reactR) ? "def" : kick ? "kick" : "other",
      share = (k) => (k === 0 && (kind === "bounce" || kind === "kick") ? PREP_FED_SHARE : 0);
    return pick.map((k, i) => ({ t: tempi[i], f: share(k), ...both((de) => tpl[k](de)) }));
  }
  /* adds the preparation block right after the warm-up (called in buildSession while the unit's sport is active) */
  function addPrep(s) {
    if (!["T", "C", "P"].includes(s.type)) return;
    const wi = s.blocks.findIndex((b) => b.key === "warm"),
      ri = s.blocks.findIndex((b) => b.rounds);
    if (wi < 0 || ri < 0 || ri < wi || s.blocks[wi].min - PREP_MIN < 6) return;
    const parts = prepParts(s.min),
      steps = prepSteps(s, parts);
    if (!steps) return;
    s.blocks[wi].min -= PREP_MIN;
    s.blocks.splice(wi + 1, 0, { key: "prep", lbl: "prep", min: PREP_MIN, items: [{ kind: "ex", id: "pre.focus_prep", n: parts, s: prepSecs(parts), steps }] });
  }
  const isFocusPrep = (it) => !!(it && it.id === "pre.focus_prep" && it.steps);
  /* the timer: the parts with 5 s change between them */
  function prepPhases(it, W) {
    const T = PREP_TEMPO[S.profile.lang === "de" ? "de" : "en"],
      out = [];
    it.steps.forEach((st, i) => {
      out.push({ seconds: it.s, label: `${i + 1}/${it.steps.length} · ${T[st.t]}` });
      if (i < it.steps.length - 1) out.push({ seconds: 5, label: W.change });
    });
    return out;
  }
  /* the dose line; with Federn the share is named – the same seconds as in the balance */
  const prepDose = (it) => {
    const f = Math.round(prepFedOf(it)),
      de = S.profile.lang === "de";
    return (de ? `${it.n} × ${it.s} s · langsam → Arbeitstempo` : `${it.n} × ${it.s} s · slow → working pace`) + (f ? (de ? ` · davon ${f} s Federn` : ` · incl. ${f} s bouncing`) : "");
  };
  /* the text on the card: guiding sentence, then the parts */
  function prepLines(sess, it) {
    const lg = S.profile.lang === "de" ? "de" : "en",
      T = PREP_TEMPO[lg];
    return it.steps.map((st, i) => `${i + 1}. ${T[st.t]}: ${st[lg]}`);
  }
  /* calls: at the start the guiding sentence, at each part its tempo and content (shared speech path) */
  function prepTick(tm) {
    const sess = S.sessions[tm.ds],
      it = sess && sess.blocks[tm.bi] && sess.blocks[tm.bi].items[tm.ni];
    if (!isFocusPrep(it) || !tm.running || tm.restOnly) return;
    if (tm.prepI === tm.index) return;
    tm.prepI = tm.index;
    const ph = tm.phases[tm.index],
      lg = S.profile.lang === "de" ? "de" : "en";
    if (!ph) return;
    // the guiding sentence was said on its own page before (18.11.2026)
    if (ph.prep) return;
    if (/Wechsel|Change/.test(ph.label || "")) return;
    const wi = tm.phases.slice(0, tm.index + 1).filter((p) => !p.prep && !/Wechsel|Change/.test(p.label || "")).length - 1,
      st = it.steps[wi];
    if (st) say(`${PREP_TEMPO[lg][st.t]}. ${st[lg]}`, 0.95);
  }
