  /* ============ Help & questions (Betreiber 15.11.2026) ============
     A "?" on every page opens the help: the questions for this page first, then all of them by topic, with a search.
     Every answer that belongs to a function has a button that goes there and marks the spot – so the function can be
     used even if you don't find it yourself. Texts live here (DE/EN side by side), the targets in HELP_GO. */
  const HELP_GO = {
    tour: { run: () => startTour() },
    guide: { tab: "profile", sec: "guide" },
    sport: { tab: "profile", sec: "me", sel: "[data-psport], [data-p]" },
    belt: { tab: "profile", sec: "me", sel: "[data-belt], [data-pedit], [data-tk]" },
    limits: { tab: "profile", sec: "me", sel: "[data-lim]" },
    birth: { tab: "profile", sec: "me", sel: "#pBirth" },
    lang: { sel: ".lang" },
    simple: { tab: "profile", sec: "app", sel: "[data-simple]" },
    club: { tab: "profile", sec: "train", sel: ".cday" },
    days: { tab: "profile", sec: "train", sel: "#pMin" },
    low: { tab: "profile", sec: "life", sel: "[data-low]" },
    week: { tab: "profile", sec: "life", sel: "[data-mood], [data-work]" },
    pause: { tab: "profile", sec: "life", sel: "[data-pnew]" },
    ko: { tab: "profile", sec: "life", sel: "[data-konew], [data-kodel]" },
    relax: { tab: "profile", sec: "life", sel: "[data-rx]" },
    adjust: { tab: "session", sel: "details.session-settings" },
    move: { tab: "session", sel: "[data-move]" },
    // a planned day without a prepared session shows "Create session" instead – that is marked then
    start: { tab: "session", sel: '[data-workout="start"], #buildSess' },
    finish: { tab: "session", sel: '#sessionFinish, [data-workout="start"], #buildSess' },
    plan: { tab: "week", sel: ".strip, .wkstrip, [data-wk]" },
    clublog: { tab: "week", sel: "[data-clublog], .clubbox" },
    ftimer: { run: () => openFt() },
    voice: { tab: "profile", sec: "app", sel: "[data-vtest]" },
    combos: { tab: "profile", sec: "app", sel: '[data-cact="new"], [data-cedit], [data-con]' },
    weight: { tab: "log", sel: "#wIn" },
    comp: { tab: "profile", sec: "goals", sel: "#pCompNew" },
    wc: { tab: "profile", sec: "goals", sel: "[data-wc], #pCompNew" },
    progress: { tab: "log" },
    summary: { tab: "profile", sec: "app", sel: '[data-io="txt"]' },
    fit: { tab: "test", view: "fit", sel: "#tOpen" },
    exam: { tab: "test", view: "exam" },
    examDate: { tab: "profile", sec: "goals", sel: "[data-gotoexam], #tkDate, #pCompNew" },
    backup: { tab: "profile", sec: "app", sel: '[data-io="exp"]' },
    restore: { tab: "profile", sec: "app", sel: '[data-io="imp"]' },
    arc: { tab: "profile", sec: "goals", sel: "#parc, [data-arc]" },
    season: { tab: "profile", sec: "app", sel: "[data-season]" },
  };
  /* [id, topic, pages where it comes first, target] – the words are in HELP_TXT */
  const HELP_Q = [
    ["what", "start", ["week"], "tour"],
    ["firstDo", "start", ["week"], "start"],
    ["install", "start", ["week"], null],
    ["sport", "start", ["profile"], "sport"],
    ["belt", "start", ["profile", "test"], "belt"],
    ["lang", "start", [], "lang"],
    ["simple", "start", ["profile"], "simple"],
    ["club", "plan", ["week", "profile"], "club"],
    ["days", "plan", ["week", "profile"], "days"],
    ["move", "plan", ["week", "session"], "move"],
    ["missed", "plan", ["week"], "plan"],
    ["clublog", "plan", ["week"], "clublog"],
    ["adjust", "plan", ["session"], "adjust"],
    ["low", "plan", ["week"], "low"],
    ["week", "plan", [], "week"],
    ["pause", "plan", ["week", "profile"], "pause"],
    ["block", "plan", [], "comp"],
    ["start", "train", ["session", "week"], "start"],
    ["info", "train", ["session"], "start"],
    ["finish", "train", ["session"], "finish"],
    ["effort", "train", ["session"], "finish"],
    ["ftimer", "train", ["session"], "ftimer"],
    ["voice", "train", [], "voice"],
    ["combos", "train", [], "combos"],
    ["relax", "train", [], "relax"],
    ["weight", "progress", ["log"], "weight"],
    ["comp", "progress", ["log", "profile"], "comp"],
    ["wc", "progress", ["log"], "wc"],
    ["prs", "progress", ["log"], "progress"],
    ["summary", "progress", ["log"], "summary"],
    ["arc", "progress", [], "arc"],
    ["fit", "tests", ["test"], "fit"],
    ["exam", "tests", ["test"], "exam"],
    ["examDate", "tests", ["test"], "examDate"],
    ["backup", "data", ["profile"], "backup"],
    ["phone", "data", [], "restore"],
    ["offline", "data", [], null],
    ["privacy", "data", [], null],
    ["season", "data", [], "season"],
    ["pain", "safety", ["session"], "limits"],
    ["ko", "safety", [], "ko"],
    ["kids", "safety", [], "birth"],
    ["guide", "safety", [], "guide"],
  ];
  const HELP_TXT = {
    de: {
      btn: "Hilfe",
      title: "Hilfe & Fragen",
      search: "Suchen, z. B. Turnier oder Sicherung",
      here: "Zu dieser Seite",
      none: "Dazu habe ich nichts gefunden. Versuch ein anderes Wort – oder schau die Themen unten durch.",
      go: "Hinführen",
      tour: "App-Tour noch einmal ansehen",
      guide: "Ratgeber öffnen",
      busy: ["Training läuft", "Beende oder pausiere zuerst dein Training bzw. den Rundentimer – danach führt dich die Hilfe dorthin."],
      noTrain: {
        h: "Gerade keine Einheit geplant",
        pause: (d) => (d ? `Deine Pause läuft bis ${d}. Danach plant Ringzeit wieder Einheiten.` : "Deine Pause läuft noch. Beende sie, wenn du wieder trainieren willst."),
        pauseBtn: "Zur Pause",
        noDays: "Du hast noch keine Ringzeit-Tage gewählt. Trag sie ein, dann plant Ringzeit deine Einheiten.",
        daysBtn: "Trainingstage eintragen",
        done: (d) => (d ? `Alles erledigt. Deine nächste Einheit ist am ${d}.` : "Alles erledigt – in den nächsten Wochen ist keine Einheit geplant."),
      },
      topics: {
        start: "Loslegen",
        plan: "Planen & Woche",
        train: "Trainieren",
        progress: "Verlauf, Gewicht & Turniere",
        tests: "Tests & Prüfungen",
        data: "Daten & Handy",
        safety: "Sicherheit & Ratgeber",
      },
      q: {
        what: ["Was macht Ringzeit eigentlich?", "Ringzeit ergänzt dein Vereinstraining. Es plant deine eigenen Einheiten rund um die Vereinstage, führt dich mit Gong und Ansage durch das Training und passt die Belastung an das an, was du einträgst. Die App-Tour zeigt dir in einer Minute, wo was ist."],
        firstDo: ["Was mache ich als Erstes?", "Öffne „Einheit“ und tippe auf „Training beginnen“ – die App führt dich Übung für Übung durch. Am Ende trägst du ein, wie anstrengend es war. Mehr ist für den Start nicht nötig."],
        install: ["Wie lege ich die App auf den Startbildschirm?", "iPhone: in Safari auf „Teilen“ und dann „Zum Home-Bildschirm“. Android: in Chrome über das Menü ⋮ „App installieren“ oder „Zum Startbildschirm hinzufügen“. Danach startet Ringzeit wie eine normale App und funktioniert auch offline."],
        sport: ["Wie ändere ich Sportart oder Disziplin?", "Profil → Über mich → Sport & Gürtel. Dein Plan wird danach automatisch angepasst."],
        belt: ["Wo trage ich meinen Gürtel oder Grad ein?", "Profil → Über mich → Sport & Gürtel. Dort stellst du auch dein Technikniveau ein – davon hängt ab, welche Techniken vorkommen."],
        lang: ["Kann ich die Sprache wechseln?", "Ja, oben rechts auf jeder Seite: DE oder EN."],
        simple: ["Mir ist das zu viel – geht es einfacher?", "Ja. Unter Profil → App & Daten → Ansicht „Einfach“ wählen. Dann siehst du nur das Wichtigste; Tests und Verlauf findest du im Profil."],
        club: ["Wie trage ich meine Vereinstage ein?", "Profil → Trainingswoche → Vereinstage antippen und die Dauer wählen. Ringzeit plant deine eigenen Einheiten dann drumherum."],
        days: ["Wie ändere ich meine Trainingstage oder die Dauer?", "Profil → Trainingswoche: Tage antippen und unten die Dauer pro Einheit einstellen. Der Plan wird sofort neu berechnet."],
        move: ["Wie verschiebe ich eine Einheit?", "Tippe in der Woche auf die Einheit und dann auf „Verschieben“. Du siehst, welche Tage frei sind."],
        missed: ["Ich habe eine Einheit verpasst – was nun?", "Verpasste Einheiten erscheinen auf „Heute“ mit „Nachholen“ oder „Auslassen“. Beides ist in Ordnung – der Plan rechnet damit."],
        clublog: ["Wie trage ich ein Vereinstraining ein?", "Am Vereinstag steht auf „Heute“ das Vereinstraining mit „Eintragen“. Dort wählst du, was ihr gemacht habt, und wie anstrengend es war. So zählt es bei der Belastung mit."],
        adjust: ["Wie ändere ich Art, Ort oder Ausrüstung einer Einheit?", "In der Einheit oben „Einheit anpassen“ öffnen: Art, Dauer, Ort und Ausrüstung wählen und den Plan neu erstellen."],
        low: ["Ich habe heute wenig Zeit.", "Schalte unter Profil → Alltag & Pausen den Wenig-Zeit-Modus ein. Dann dauern die Einheiten höchstens 30 Minuten."],
        week: ["Stressige Woche oder viel Arbeit?", "Unter Profil → Alltag & Pausen gibst du an, wie deine Woche läuft und wie anstrengend deine Arbeit ist. Ringzeit passt die Einheiten daran an."],
        pause: ["Ich bin krank, verletzt oder im Urlaub.", "Profil → Alltag & Pausen → „Pause eintragen“. Während der Pause ruht der Plan und deine Serie bleibt erhalten; danach steigst du sanft wieder ein."],
        block: ["Was bedeutet „Grundlage“ oder „Aufbau“ oben auf der Seite?", "Das ist die Trainingsphase. Mit einem Turnier- oder Prüfungstermin läuft der Plan in Phasen darauf hin – von Grundlage über Aufbau bis Tapering –, ohne Termin bleibt es bei Grundlage."],
        start: ["Wie starte ich das Training?", "„Einheit“ öffnen und „Training beginnen“ tippen. Zeitübungen laufen mit Gong und Ansage, sonst tippst du ✓; bei Kraftübungen trägst du Wiederholungen ein."],
        info: ["Wie geht eine Übung?", "Tippe in der Einheit auf ⓘ neben der Übung: Skizze, Ausführung und der typische Fehler."],
        finish: ["Wie schließe ich eine Einheit ab?", "Am Ende des Trainings – oder unten in der Einheit – trägst du Dauer und Anstrengung ein und speicherst."],
        effort: ["Was bedeutet die Anstrengung (RPE)?", "Du wählst, wie hart es war – von ganz leicht bis Maximum (RPE 1–10). Ehrlich eintragen: daran richtet Ringzeit die nächsten Einheiten aus."],
        ftimer: ["Ich brauche nur einen Rundentimer.", "Der Timer in der Mitte der unteren Leiste ist ein freier Rundentimer – unabhängig vom Plan, z. B. fürs Vereinstraining."],
        voice: ["Wie stelle ich die Ansage ein?", "Profil → App & Daten → Runden-Ansage: Stimme wählen und probehören."],
        combos: ["Kann ich eigene Kombinationen anlegen?", "Ja, unter Profil → App & Daten → Meine Kombis. Sie kommen dann in deinen Einheiten vor."],
        relax: ["Gibt es etwas zum Runterkommen?", "Unter Profil → Alltag & Pausen findest du Atmen und Entspannen – auch an Ruhetagen."],
        weight: ["Wo trage ich mein Gewicht ein?", "Unter „Verlauf“ → Gewicht. Am besten immer gleich wiegen: morgens, vor dem Frühstück."],
        comp: ["Wie trage ich ein Turnier ein?", "Profil → Termine & Ziele → Datum wählen und hinzufügen. Der Plan läuft dann darauf hin."],
        wc: ["Wo gebe ich meine Gewichtsklasse an?", "Beim Turnier unter Profil → Termine & Ziele. Danach erinnert Ringzeit wöchentlich ans Wiegen und zeigt unter Verlauf, wie weit es noch ist."],
        prs: ["Wo sehe ich meinen Fortschritt?", "Unter „Verlauf“: Woche, Serie, Kalender, Abzeichen, Gewicht und Bestleistungen."],
        summary: ["Wie zeige ich meinem Trainer, was ich gemacht habe?", "Profil → App & Daten → Übersicht für den Trainer: als Bild oder Text, mit den letzten 4 Kalenderwochen."],
        arc: ["Was ist der Winter Arc?", "Eine freiwillige Challenge für die dunkle Jahreszeit mit kleinen täglichen Gewohnheiten. Starten und einstellen unter Profil → Termine & Ziele."],
        fit: ["Wie mache ich den Fitnesstest?", "Unter „Test“ → Fitnesstest → „Test starten“. Er dauert etwa 30 Minuten; mach ihn ausgeruht. Danach passt Ringzeit die Belastung an."],
        exam: ["Wie bereite ich mich auf die Gürtelprüfung vor?", "Unter „Test“ → Gürtelprüfung findest du, was verlangt wird, und kannst üben."],
        examDate: ["Wo trage ich einen Prüfungstermin ein?", "Profil → Termine & Ziele. Mit Termin plant Ringzeit die Vorbereitung ein."],
        backup: ["Wie sichere ich meine Daten?", "Profil → App & Daten → „Sicherung speichern“. Die Datei am besten in die Cloud oder an dich selbst schicken. Ringzeit erinnert dich regelmäßig."],
        phone: ["Ich habe ein neues Handy.", "Auf dem alten Handy „Sicherung speichern“, die Datei aufs neue Handy bringen und dort unter Profil → App & Daten „Sicherung laden“."],
        offline: ["Funktioniert die App ohne Internet?", "Ja. Nach dem ersten Laden läuft Ringzeit komplett offline."],
        privacy: ["Wer sieht meine Daten?", "Niemand. Alles bleibt auf deinem Handy, es gibt kein Konto und keinen Server. Deshalb ist die Sicherung wichtig."],
        season: ["Kann ich Feste und Jahreszeiten-Design ausschalten?", "Ja, unter Profil → App & Daten → Jahreszeiten-Design."],
        pain: ["Ich habe Schmerzen oder eine Verletzung.", "Training sofort abbrechen. Bei länger anhaltenden Beschwerden zum Arzt. Unter Profil → Über mich kannst du Einschränkungen angeben – Ringzeit lässt belastende Übungen dann weg."],
        ko: ["Ich hatte einen K.-o. oder Kopftreffer.", "Unter Profil → Alltag & Pausen eintragen. Ringzeit sperrt dann Sparring und harte Einheiten für die vorgeschriebene Zeit. Bei Kopfschmerz, Schwindel oder Übelkeit: ärztlich abklären."],
        kids: ["Was ist anders für Kinder und Jugendliche?", "Ringzeit richtet sich nach dem Geburtsdatum: Übungen, Belastung und erlaubte Techniken passen sich dem Alter an, Gewichtshinweise gibt es erst ab 15. Das Geburtsdatum steht unter Profil → Über mich."],
        guide: ["Wo lerne ich Bandagieren oder Erste Hilfe?", "Im Ratgeber: Bandagieren, Materialpflege, Erste Hilfe und Lesestoff zu deinem Sport."],
      },
    },
    en: {
      btn: "Help",
      title: "Help & questions",
      search: "Search, e.g. tournament or backup",
      here: "On this page",
      none: "Nothing found. Try another word – or browse the topics below.",
      go: "Take me there",
      tour: "Watch the app tour again",
      guide: "Open the guide",
      busy: ["Training in progress", "Finish or pause your training or the round timer first – then the help takes you there."],
      noTrain: {
        h: "No session planned right now",
        pause: (d) => (d ? `Your break lasts until ${d}. After that Ringzeit plans sessions again.` : "Your break is still on. End it when you want to train again."),
        pauseBtn: "Go to the break",
        noDays: "You haven't chosen any Ringzeit days yet. Add them and Ringzeit plans your sessions.",
        daysBtn: "Add training days",
        done: (d) => (d ? `All done. Your next session is on ${d}.` : "All done – no session planned in the coming weeks."),
      },
      topics: {
        start: "Getting started",
        plan: "Planning & week",
        train: "Training",
        progress: "History, weight & tournaments",
        tests: "Tests & gradings",
        data: "Data & phone",
        safety: "Safety & guide",
      },
      q: {
        what: ["What does Ringzeit do?", "Ringzeit adds to your club training. It plans your own sessions around your club days, guides you through each session with bell and voice, and adjusts the load to what you log. The app tour shows you where everything is in a minute."],
        firstDo: ["What do I do first?", "Open “Session” and tap “Start training” – the app guides you exercise by exercise. At the end you log how hard it was. That's all you need to start."],
        install: ["How do I put the app on my home screen?", "iPhone: in Safari tap “Share”, then “Add to Home Screen”. Android: in Chrome use the menu ⋮ → “Install app” or “Add to Home screen”. Afterwards Ringzeit starts like any app and also works offline."],
        sport: ["How do I change sport or discipline?", "Profile → About me → Sport & belt. Your plan is adjusted automatically."],
        belt: ["Where do I enter my belt or grade?", "Profile → About me → Sport & belt. There you also set your technique level – it decides which techniques come up."],
        lang: ["Can I change the language?", "Yes, top right on every page: DE or EN."],
        simple: ["This is too much – is there a simpler view?", "Yes. Choose the “Simple” view under Profile → App & data. You'll only see what matters; tests and history are in the profile."],
        club: ["How do I enter my club days?", "Profile → Training week → tap your club days and pick the length. Ringzeit plans your own sessions around them."],
        days: ["How do I change my training days or length?", "Profile → Training week: tap the days and set the length per session below. The plan is recalculated right away."],
        move: ["How do I move a session?", "Tap the session in the week, then “Move”. You'll see which days are free."],
        missed: ["I missed a session – now what?", "Missed sessions show up on “Today” with “Catch up” or “Skip”. Both are fine – the plan expects it."],
        clublog: ["How do I log a club session?", "On a club day “Today” shows the club session with “Log”. Pick what you did and how hard it was, so it counts towards your load."],
        adjust: ["How do I change type, place or equipment of a session?", "Open “Adjust session” at the top of the session: choose type, length, place and equipment and build the plan again."],
        low: ["I'm short on time today.", "Turn on low-time mode under Profile → Daily life & breaks. Sessions then last 30 minutes at most."],
        week: ["Stressful week or lots of work?", "Under Profile → Daily life & breaks you tell Ringzeit how your week is going and how demanding your work is. It adjusts the sessions to it."],
        pause: ["I'm ill, injured or on holiday.", "Profile → Daily life & breaks → “Add break”. During the break the plan rests and your streak is kept; afterwards you ease back in."],
        block: ["What does “Foundation” or “Build” at the top mean?", "That is the training phase. With a tournament or grading date the plan runs through phases towards it – from foundation through build to taper –, without a date it stays at foundation."],
        start: ["How do I start training?", "Open “Session” and tap “Start training”. Timed exercises run with bell and voice, otherwise tap ✓; for strength you log the reps."],
        info: ["How is an exercise done?", "Tap ⓘ next to the exercise in the session: sketch, how to do it and the typical mistake."],
        finish: ["How do I finish a session?", "At the end of the training – or at the bottom of the session – enter length and effort and save."],
        effort: ["What does effort (RPE) mean?", "You choose how hard it was – from very easy to max (RPE 1–10). Be honest: Ringzeit sets the next sessions by it."],
        ftimer: ["I only need a round timer.", "The timer in the middle of the bottom bar is a free round timer – separate from the plan, e.g. for club training."],
        voice: ["How do I set the announcer?", "Profile → App & data → Round announcer: pick a voice and listen to a sample."],
        combos: ["Can I create my own combinations?", "Yes, under Profile → App & data → My combos. They then come up in your sessions."],
        relax: ["Is there something to wind down?", "Profile → Daily life & breaks has breathing and relaxation – on rest days too."],
        weight: ["Where do I log my weight?", "Under “History” → Weight. Best weigh the same way each time: in the morning, before breakfast."],
        comp: ["How do I add a tournament?", "Profile → Dates & goals → pick the date and add it. The plan then leads up to it."],
        wc: ["Where do I set my weight class?", "With the tournament under Profile → Dates & goals. Ringzeit then reminds you weekly to weigh in and shows under History how far there is to go."],
        prs: ["Where do I see my progress?", "Under “History”: week, streak, calendar, badges, weight and personal bests."],
        summary: ["How do I show my coach what I did?", "Profile → App & data → Summary for your coach: as image or text, with the last 4 calendar weeks."],
        arc: ["What is the Winter Arc?", "A voluntary challenge for the dark season with small daily habits. Start and set it up under Profile → Dates & goals."],
        fit: ["How do I do the fitness test?", "Under “Test” → Fitness test → “Start test”. It takes about 30 minutes; do it rested. Ringzeit then adjusts the load."],
        exam: ["How do I prepare for my belt grading?", "Under “Test” → Grading you find what is asked and can practise."],
        examDate: ["Where do I enter a grading date?", "Profile → Dates & goals. With a date Ringzeit plans the preparation."],
        backup: ["How do I back up my data?", "Profile → App & data → “Save backup”. Best send the file to your cloud or to yourself. Ringzeit reminds you regularly."],
        phone: ["I have a new phone.", "On the old phone “Save backup”, bring the file to the new phone and use “Load backup” under Profile → App & data there."],
        offline: ["Does the app work without internet?", "Yes. After the first load Ringzeit runs fully offline."],
        privacy: ["Who sees my data?", "Nobody. Everything stays on your phone – no account, no server. That's why the backup matters."],
        season: ["Can I turn off feasts and the seasonal design?", "Yes, under Profile → App & data → Seasonal design."],
        pain: ["I have pain or an injury.", "Stop training right away. See a doctor if it lasts. Under Profile → About me you can enter limits – Ringzeit then leaves out exercises that strain them."],
        ko: ["I had a KO or head blows.", "Enter it under Profile → Daily life & breaks. Ringzeit then blocks sparring and hard sessions for the required time. With headache, dizziness or nausea: see a doctor."],
        kids: ["What is different for children and teens?", "Ringzeit goes by the date of birth: exercises, load and allowed techniques fit the age, weight notes only from 15. The date of birth is under Profile → About me."],
        guide: ["Where do I learn hand wrapping or first aid?", "In the guide: hand wrapping, gear care, first aid and reading about your sport."],
      },
    },
  };
  const helpT = () => HELP_TXT[S.profile.lang === "de" ? "de" : "en"];
  const helpBtn = () => `<button type="button" class="helpbtn" data-help="1" aria-label="${helpT().title}">?</button>`;
  function helpItem(q, open) {
    const H = helpT(),
      [qq, a] = H.q[q[0]];
    return `<details class="hq" data-hq="${q[0]}" data-q="${esc((qq + " " + a).toLowerCase())}"${open ? " open" : ""}><summary>${esc(qq)}</summary><div><p>${esc(a)}</p>${q[3] ? `<button type="button" class="btn sec" data-help-go="${q[3]}">${H.go} ›</button>` : ""}</div></details>`;
  }
  function helpHtml() {
    const H = helpT(),
      page = ui.tab,
      here = HELP_Q.filter((q) => q[2].includes(page));
    let h = `<h3>${H.title}</h3><input id="helpQ" type="search" placeholder="${esc(H.search)}" autocomplete="off" aria-label="${esc(H.search)}"><p class="sub hnone" hidden>${esc(H.none)}</p>`;
    if (here.length) h += `<div class="hsec hhere"><div class="lab">${H.here}</div>${here.map((q) => helpItem(q)).join("")}</div>`;
    h += Object.entries(H.topics)
      .map(([k, l]) => `<details class="hgrp" data-hg="${k}"><summary>${l}</summary>${HELP_Q.filter((q) => q[1] === k).map((q) => helpItem(q)).join("")}</details>`)
      .join("");
    h += `<div class="acts2"><button type="button" class="btn sec" data-help-go="tour">${H.tour}</button><button type="button" class="btn sec" data-help-go="guide">${H.guide}</button></div><div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    return h;
  }
  const openHelp = () => openSheet({ kind: "help" });
  /* search: filters in place (no re-render, so the keyboard stays open) */
  function helpFilter(v) {
    const box = document.getElementById("sheet");
    if (!box) return;
    const q = (v || "").trim().toLowerCase(),
      words = q.split(/\s+/).filter(Boolean),
      here = box.querySelector(".hhere");
    if (here) here.hidden = !!q;
    let n = 0;
    box.querySelectorAll(".hgrp").forEach((g) => {
      let m = 0;
      g.querySelectorAll(".hq").forEach((it) => {
        const hit = !q || words.every((w) => it.dataset.q.includes(w));
        it.hidden = !hit;
        if (hit) m++;
      });
      g.hidden = !m;
      g.open = !!q && m > 0;
      n += m;
    });
    const none = box.querySelector(".hnone");
    if (none) none.hidden = !q || n > 0;
  }
  /* go to the function: the right page or profile section, the spot scrolled into view and marked for a moment */
  /* targets that need a session: the help leads to one that is really there (Codeprüfung 15.11.2026) */
  const HELP_SESS = new Set(["start", "finish", "adjust", "move"]);
  // the day for a session target: a chosen day that fits, else the next planned and not yet done session (14 days);
  // "finish" looks at today first
  function helpDay(key) {
    const td = iso(today()),
      fits = (ds) => !!ds && ds >= td && !!planOn(ds) && !doneOn(ds);
    if (key === "finish" && fits(td)) return td;
    if (fits(ui.sel)) return ui.sel;
    for (let i = 0; i < 14; i++) {
      const ds = iso(addDays(today(), i));
      if (fits(ds)) return ds;
    }
    return null;
  }
  // no session to lead to: say why, with the button that helps
  function helpNoTrain() {
    const N = helpT().noTrain,
      td = iso(today()),
      pz = pausedOn(td) || (S.pauses || []).find((x) => x.from > td && x.from <= iso(addDays(today(), 13)));
    let msg, btn;
    if (pz) {
      msg = N.pause(pz.to ? fmtDate(pz.to) : "");
      btn = ["pause", N.pauseBtn];
    } else if (!(S.profile.days || []).length) {
      msg = N.noDays;
      btn = ["days", N.daysBtn];
    } else {
      let next = "";
      for (let i = 14; i < 70 && !next; i++) {
        const ds = iso(addDays(today(), i));
        if (planOn(ds) && !doneOn(ds)) next = ds;
      }
      msg = N.done(next ? fmtDate(next) : "");
    }
    ui.tab = "week";
    render(true);
    openSheet({ kind: "show", title: N.h, html: `<p class="sub">${esc(msg)}</p>${btn ? `<div class="acts2"><button type="button" class="btn sec" data-help-go="${btn[0]}">${esc(btn[1])} ›</button></div>` : ""}` });
  }
  function helpGo(key) {
    const g = HELP_GO[key];
    if (!g) return;
    closeSheet();
    // a begun training or a running round timer is kept: only its own session can be shown, nothing else
    const ftBusy = ui.ft && ui.ft.phase !== "setup";
    if (key === "ftimer" && ui.ft) return openFt();
    if (ui.workout || ftBusy) {
      if (!(ui.workout && !ftBusy && HELP_SESS.has(key))) {
        const B = helpT().busy;
        return openSheet({ kind: "show", title: B[0], html: `<p class="sub">${esc(B[1])}</p>` });
      }
      ui.tab = "session";
      ui.sel = ui.workout.ds;
      render(true);
      return setTimeout(() => helpMark(g.sel), 80);
    }
    // an idle timer screen is closed
    if (ui.ft) closeFt();
    if (g.run) return g.run();
    if (HELP_SESS.has(key)) {
      const ds = helpDay(key);
      if (!ds) return helpNoTrain();
      ui.sel = ds;
    }
    if (g.tab) {
      ui.tab = g.tab;
      if (g.tab === "profile") ui.profSec = g.sec || null;
      if (g.view) ui.testView = g.view;
      if (g.tab === "test") ui.testOpen = false;
      render(true);
    }
    // after the page has settled (render may still swap parts in)
    setTimeout(() => helpMark(g.sel), 80);
  }
  function helpMark(sel) {
    // the alternatives in the order given (the first one that exists), not in page order
    let el = null;
    for (const part of (sel || "").split(/,\s*/)) if (part && !el) el = document.querySelector(part);
    if (!el) {
      if (typeof scrollTo === "function") scrollTo(0, 0);
      return;
    }
    const d = el.closest("details");
    if (d) d.open = true;
    if (el.tagName === "DETAILS") el.open = true;
    // a button is marked itself (in a long open panel the frame would be off screen), other spots with their panel
    const box = el.tagName === "BUTTON" ? el : el.closest(".panel") || el.closest(".field, details") || el;
    if (box.scrollIntoView) box.scrollIntoView({ block: "center", behavior: "smooth" });
    box.classList.add("hlp");
    setTimeout(() => box.classList.remove("hlp"), 2600);
  }
