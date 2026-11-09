  /* ============ Bottom sheet: small forms and confirmations ============ */
  function openSheet(o) {
    ui.sheet = o;
    renderSheet();
  }
  function closeSheet() {
    ui.sheet = null;
    renderSheet();
  }
  function renderSheet() {
    const el = document.getElementById("sheet"),
      o = ui.sheet;
    if (!o) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    const cancel = `<button type="button" class="btn sec" data-sx="close">${t("cancel")}</button>`,
      save = (a) => `<button type="button" class="btn" data-sx="${a}">${t("save")}</button>`;
    // re-rendering the same sheet (toggles, quiz, combo builder) keeps its scroll position and doesn't animate again
    const again = renderSheet.last === o && !el.hidden,
      oldTop = again && el.firstElementChild ? el.firstElementChild.scrollTop : 0;
    renderSheet.last = o;
    let h = `<div class="sheet${again ? " still" : ""}" role="dialog" aria-modal="true"><div class="grab"></div>`;
    if (o.kind === "club") {
      h += `<h3>${t("club")} · ${esc(dayLbl(o.ds))}</h3>${sportRow("data-ssp", o.sport)}<div class="lab">${t("clubWhat")}</div><div class="seg g3">${["T", "P", "K", "S", "X"].map((k) => `<button type="button" data-sck="${k}" aria-pressed="${o.ck === k}">${t("clubKinds")[k]}</button>`).join("")}</div>
 <label class="lab" for="scMin">${t("duration")}</label><input id="scMin" type="number" inputmode="numeric" min="10" max="300" value="${o.min}">
 <span class="lab" id="scRpeL">${t("rpe")}</span><div class="effort-faces" role="group" aria-labelledby="scRpeL">${effortFaces()
   .map(
     ([n, f, l]) =>
       `<button type="button" data-scface="${n}" aria-pressed="${faceOf(o.rpe) === n}" aria-label="${esc(l)}"><span aria-hidden="true">${f}</span><small>${esc(l)}</small></button>`,
   )
   .join("")}</div><input id="scRpe" type="hidden" value="${o.rpe}">
 <label class="lab" for="scNote">${t("note")}</label><textarea id="scNote">${esc(o.note || "")}</textarea>
 <div class="acts2">${cancel}${save("clubsave")}</div>`;
    } else if (o.kind === "freerun" || o.kind === "edit") {
      const free = o.kind === "freerun" || o.run === "free",
        own = o.kind === "freerun" || o.src !== "club";
      h += `<h3>${o.kind === "freerun" ? t("freeRunTitle") : t("edit")} · ${esc(dayLbl(o.ds))}</h3>${sportRow("data-ssp", o.sport)}`;
      if (o.kind === "edit")
        h += own
          ? `<div class="lab">${t("sessType")}</div><div class="seg g3">${["T", "C", "P", "S", "K", "M"].map((k) => `<button type="button" data-edt="${k}" aria-pressed="${o.type === k}">${t("types")[k]}</button>`).join("")}</div>`
          : `<div class="lab">${t("clubWhat")}</div><div class="seg g3">${["T", "P", "K", "S", "X"].map((k) => `<button type="button" data-sck="${k}" aria-pressed="${o.ck === k}">${t("clubKinds")[k]}</button>`).join("")}</div>`;
      h += `<label class="lab" for="scMin">${t("duration")}</label><input id="scMin" type="number" inputmode="numeric" min="1" max="300" value="${o.min ?? ""}">`;
      if (free) h += `<label class="lab" for="scKm">${t("freeRunKm")}</label><input id="scKm" type="text" inputmode="decimal" value="${esc(o.kmRaw ?? "")}">`;
      h += `<span class="lab" id="scRpeL">${t("rpe")}</span><div class="effort-faces" role="group" aria-labelledby="scRpeL">${effortFaces()
        .map(([n, f, l]) => `<button type="button" data-scface="${n}" aria-pressed="${faceOf(o.rpe) === n}" aria-label="${esc(l)}"><span aria-hidden="true">${f}</span><small>${esc(l)}</small></button>`)
        .join("")}</div><input id="scRpe" type="hidden" value="${o.rpe ?? ""}">
 ${o.kind === "edit" && own && !free ? effortControlHtml({type:o.type,effortDose:o.effortDose},o,true) : ""}<label class="lab" for="scNote">${t("note")}</label><textarea id="scNote">${esc(o.note || "")}</textarea>${o.err ? `<div class="note warn" role="alert">${esc(o.err)}</div>` : ""}
 <div class="acts2">${cancel}${save(o.kind === "freerun" ? "freerunsave" : "editsave")}</div>`;
    } else if (o.kind === "move") {
      const rows = [];
      for (let i = 0; i < 14; i++) {
        const d = iso(addDays(today(), i));
        if (d === o.ds || pausedOn(d)) continue;
        const busy = o.club ? !!(clubOn(d) || clubDone(d)) : !!(planOn(d) || doneOn(d)),
          tag = busy ? t("taken") : o.club ? (typeOn(d) ? t("types")[typeOn(d)] : "") : clubOn(d) ? t("clubBadge") : "";
        rows.push(
          `<button type="button" data-mto="${d}" ${busy ? "disabled" : ""}><b>${esc(dayLbl(d))}</b><span class="sub">${tag}</span></button>`,
        );
      }
      h += `<h3>${t("moveTo")}</h3><div class="mlist">${rows.join("")}</div><div class="acts2">${cancel}</div>`;
    } else if (o.kind === "guide") {
      h += guideSheetHtml(o);
    } else if (o.kind === "pack") {
      h += packSheetHtml(o);
    } else if (o.kind === "blk") {
      h += blockSheetHtml(o);
    } else if (o.kind === "confirm") {
      h += `<h3>${esc(o.title)}</h3>${o.lines.map((x) => `<div class="note warn">${esc(x)}</div>`).join("")}<div class="acts2">${o.no ? `<button type="button" class="btn sec" data-sx="confirmNo">${esc(o.noL || t("cancel"))}</button>` : cancel}<button type="button" class="btn" data-sx="confirm">${esc(o.okL || t("sure"))}</button></div>`;
    } else if (o.kind === "result") {
      const c = (S.profile.comps || []).find((x) => x.id === o.id) || {},
        r = o.r;
      if (c.kind === "grade")
        h += `<h3>${t("compKind").grade} · ${fmtDate(c.date)}</h3><div class="lab">${t("resPassed")}</div><div class="seg">${[
          ["y", t("yes")],
          ["n", t("no")],
        ]
          .map(([k, l]) => `<button type="button" data-rp="${k}" aria-pressed="${r.passed === k}">${l}</button>`)
          .join(
            "",
          )}</div><label class="lab" for="rsGrade">${t("resGrade")}</label><input id="rsGrade" type="text" value="${esc(r.grade || "")}" placeholder="${t("resGradePh")}"><label class="lab" for="rsBad">${t("resBad")}</label><textarea id="rsBad">${esc(r.bad || "")}</textarea>`;
      else
        h += `<h3>${t("compKind").comp} · ${fmtDate(c.date)}</h3><div class="inline"><label class="lab">${t("resBouts")}<input id="rsB" type="number" inputmode="numeric" min="0" max="20" value="${r.bouts ?? ""}"></label><label class="lab">${t("resWins")}<input id="rsW" type="number" inputmode="numeric" min="0" max="20" value="${r.wins ?? ""}"></label></div><div class="lab">${t("resPlace")}</div><div class="seg">${["1", "2", "3", "-"].map((k) => `<button type="button" data-rpl="${k}" aria-pressed="${r.place === k}">${k === "-" ? t("resNone") : k + "."}</button>`).join("")}</div><label class="lab" for="rsGood">${t("resGood")}</label><textarea id="rsGood">${esc(r.good || "")}</textarea><label class="lab" for="rsBad">${t("resBad")}</label><textarea id="rsBad">${esc(r.bad || "")}</textarea>`;
      h += `<div class="acts2">${cancel}${save("ressave")}</div>`;
    } else if (o.kind === "pause") {
      h += `<h3>${t("pauseStart")}</h3><div class="seg">${["ill", "inj", "vac"].map((k) => `<button type="button" data-pw="${k}" aria-pressed="${o.why === k}">${t("pauseWhy")[k]}</button>`).join("")}</div><label class="lab" for="psFrom">${t("pauseFrom")}</label><input id="psFrom" type="date" value="${o.from}"><label class="lab" for="psTo">${t("pauseTo")}</label><input id="psTo" type="date" value="${o.to || ""}"><span class="sub">${t("pauseHint")}</span><div class="acts2">${cancel}${save("pausesave")}</div>`;
    } else if (o.kind === "ko") {
      h += `<h3>${t("ko")}</h3><span class="sub">${t("koHint")}</span><label class="lab" for="koDate">${t("koDate")}</label><input id="koDate" type="date" max="${iso(today())}" value="${o.date}"><div class="acts2">${cancel}${save("kosave")}</div>`;
    } else if (o.kind === "th") {
      h += `<h3>${esc(examItem(o.id)[S.profile.lang])}</h3>${thSheetHtml(o)}`;
    } else if (o.kind === "sd") {
      const x = examItem(o.id);
      h += `<h3>${esc(x[S.profile.lang])}</h3>${sdInfoHtml(o.id)}<div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    } else if (o.kind === "hard") {
      const hd = HARD.find((q) => q.id === o.id),
        x = hardTxt(o.id, o.h),
        k = SKETCH[hd.sk];
      h += `<h3>${esc(x[0])}</h3><div class="skwrap">${sketchSvg(hd.sk)}${k.hold ? `<span class="skhold">${t("skHold")}</span>` : ""}</div><p class="sub" style="margin:0">${esc(x[1])}</p><div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    } else if (o.kind === "ex") {
      h += `<h3>${esc(exText(o.id).name)}</h3>${exInfoHtml(o.id)}<div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    } else if (o.kind === "badge") {
      h += badgeSheetHtml(o);
    } else if (o.kind === "badges") {
      h += allBadgesHtml();
    } else if (o.kind === "raw") {
      h += `<h3>${esc(o.title)}</h3>${o.html}`;
    } else if (o.kind === "news") {
      const N = t("news");
      h += `<h3>${N.h}</h3><ul class="ackl">${N.pts.map((x) => `<li>${x}</li>`).join("")}</ul><div class="acts2"><button type="button" class="btn" data-news-ok="1">${N.ok}</button></div>`;
    } else if (o.kind === "show") {
      h += `<h3>${esc(o.title)}</h3>${o.html}<div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    }
    el.innerHTML = h + `</div>`;
    if (again && el.firstElementChild) el.firstElementChild.scrollTop = oldTop;
    el.hidden = false;
  }
  /* Keeps typed values when a sheet re-renders after a toggle */
  function readSheet() {
    const o = ui.sheet,
      v = (id) => {
        const e = document.getElementById(id);
        return e ? e.value : undefined;
      },
      n = (id) => {
        const x = parseInt(v(id));
        return isNaN(x) ? null : x;
      };
    if (!o) return;
    if (o.kind === "freerun" || o.kind === "edit") {
      o.min = n("scMin");
      o.rpe = n("scRpe");
      if (v("scKm") != null) o.kmRaw = v("scKm");
      if (v("scNote") != null) o.note = v("scNote");
    } else if (o.kind === "club") {
      o.min = n("scMin") || o.min;
      o.rpe = n("scRpe") || o.rpe;
      if (v("scNote") != null) o.note = v("scNote");
    } else if (o.kind === "result") {
      if (v("rsB") != null) o.r.bouts = n("rsB");
      if (v("rsW") != null) o.r.wins = n("rsW");
      ["rsGood:good", "rsBad:bad", "rsGrade:grade"].forEach((x) => {
        const [id, k] = x.split(":");
        if (v(id) != null) o.r[k] = v(id).slice(0, 300);
      });
    } else if (o.kind === "pause") {
      o.from = v("psFrom") || o.from;
      if (v("psTo") != null) o.to = v("psTo");
    } else if (o.kind === "ko") o.date = v("koDate") || o.date;
  }
  function sheetAction(a) {
    if (a === "bdgnext") {
      closeSheet();
      return showBadgeQueue();
    }
    const o = ui.sheet;
    if (!o) return;
    readSheet();
    if (a === "close") return closeSheet();
    if (a === "blkgo") {
      blockStart(o.k, o.start);
      closeSheet();
      ui.tab = "week";
      render(true);
      window.scrollTo(0, 0);
      return toast(t("blk").started);
    }
    if (a === "confirm" || a === "confirmNo") {
      const run = a === "confirm" ? o.run : o.no;
      closeSheet();
      if (run) run();
      return;
    }
    if (a === "clubsave") {
      const replanned = changeLog(() =>
        S.log.push({
          id: "e" + Date.now().toString(36),
          date: o.ds,
          src: "club",
          type: "V",
          ck: o.ck,
          sport: o.sport || mainSport(),
          tstyle: (o.sport || mainSport()) === "taekwondo" ? tkdStyle() : undefined,
          minutes: Math.max(5, Math.min(300, o.min || 90)),
          rpe: o.rpe || 7,
          note: (o.note || "").slice(0, 300),
        }),
      );
      if (S.cov[o.ds] && S.cov[o.ds].off === "miss") delete S.cov[o.ds];
      store.save();
      closeSheet();
      ui.win = true;
      render();
      showWin(S.log[S.log.length - 1]);
      if (replanned) toast(t("replanned"));
      return;
    }
    if (a === "freerunsave" || a === "editsave") {
      const km = String(o.kmRaw ?? "").trim() === "" ? undefined : parseFloat(String(o.kmRaw).replace(",", ".")),
        free = a === "freerunsave" || o.run === "free";
      if (!(o.min >= 1 && o.min <= 300) || !(o.rpe >= 1 && o.rpe <= 10) || (free && km !== undefined && !(km > 0 && km <= 200))) {
        o.err = t("freeRunNeed");
        return renderSheet();
      }
      const kmv = km === undefined ? undefined : Math.round(km * 10) / 10,
        note = (o.note || "").slice(0, 300);
      let replanned, entry;
      if (a === "freerunsave") {
        const sess = S.sessions[o.ds];
        replanned = changeLog(() =>
          S.log.push(
            (entry = {
              id: "e" + Date.now().toString(36),
              date: o.ds,
              src: "own",
              type: "K",
              run: "free",
              sport: o.sport || mainSport(),
              sid: sess?.id,
              minutes: o.min,
              rpe: o.rpe,
              km: kmv,
              completed: true,
              inputConfirmed: true,
              tHi: rpeRange("K", o.ds).hi,
              note,
            }),
          ),
        );
      } else {
        entry = S.log.find((x) => x.id === o.id);
        if (!entry) return closeSheet();
        replanned = changeLog(() => {
          if (entry.src === "club") entry.ck = o.ck;
          else {
            if (entry.type !== o.type) delete entry.reg;
            entry.type = o.type;
          }
          entry.sport = o.sport || mainSport();
          entry.minutes = o.min;
          entry.rpe = o.rpe;
          if (entry.src === "own" && !free) entry.effortControl = finishEffortControl(o);
          entry.note = note;
          if (free) entry.km = kmv;
          entry.edited = new Date().toISOString();
        });
      }
      store.save();
      closeSheet();
      if (a === "freerunsave") {
        ui.win = true;
        render();
        showWin(entry);
      } else render();
      if (replanned) toast(t("replanned"));
      return;
    }
    if (a === "ressave") {
      const c = (S.profile.comps || []).find((x) => x.id === o.id);
      if (c) c.result = { ...o.r };
      // a passed grading moves the belt up to the stage that was prepared
      const ts = targetStage();
      if (c && c.kind === "grade" && o.r.passed === "y" && ts && stageBelt(ts) > beltIdx()) {
        S.profile.belt = stageBelt(ts);
        if (draft) draft.belt = S.profile.belt;
        setTimeout(() => toast(t("beltUp")(beltName(S.profile.belt))), 2500);
      }
      if (draft) draft.comps = JSON.parse(JSON.stringify(S.profile.comps));
      store.save();
      closeSheet();
      toast(t("saved"));
      render();
      return;
    }
    if (a === "pausesave") {
      if (!o.from) return;
      let from = o.from,
        to = o.to || null;
      if (to && to < from) [from, to] = [to, from];
      S.pauses.push({
        id: "p" + Date.now().toString(36),
        from,
        to,
        why: o.why,
      });
      store.save();
      closeSheet();
      render();
      return;
    }
    if (a === "kosave") {
      S.ko = o.date;
      store.save();
      closeSheet();
      render();
    }
  }
  function endPause(id) {
    const x = S.pauses.find((q) => q.id === id),
      y = iso(addDays(today(), -1));
    if (!x) return;
    if (x.from > y) S.pauses = S.pauses.filter((q) => q.id !== id);
    else x.to = y;
  }

