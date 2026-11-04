  /* ============ Install hint and sharing: only on the published web app (GitHub Pages), never inside Claude ============ */
  const installable = () => {
    try {
      return !!document.querySelector('link[rel="manifest"]');
    } catch (e) {
      return false;
    }
  };
  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvt = e;
    if (ui.onb) renderOnb();
    else if (ui.tour == null) render();
  });
  window.addEventListener("appinstalled", () => {
    installEvt = null;
    render();
  });
  const SHARE_ICO =
    '<svg class="shr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
  function installHtml(onb) {
    if (!installable() || isStandalone() || (!onb && (S.profile.instHide || ui.instLater))) return "";
    const I = t("inst"),
      ios = isIOS();
    if (!ios && !installEvt && !/android/i.test(navigator.userAgent)) return "";
    const txt = ios
      ? I.ios.replace("Teilen", "Teilen " + SHARE_ICO).replace("Share", "Share " + SHARE_ICO)
      : I.and;
    return `<div class="insth"><b>${I.title}</b><p class="sub">${txt}${onb ? " " + I.first : ""}</p>${
      onb
        ? installEvt
          ? `<div class="acts2"><button type="button" class="btn" data-inst="go">${I.go}</button></div>`
          : ""
        : `<div class="acts2">${installEvt ? `<button type="button" class="btn" data-inst="go">${I.go}</button>` : `<a class="btn sec" href="installieren.html">${I.guide}</a>`}<button type="button" class="btn sec" data-inst="later">${I.later}</button></div>`
    }</div>`;
  }
  async function installAction(a) {
    if (a === "go" && installEvt) {
      installEvt.prompt();
      try {
        await installEvt.userChoice;
      } catch (e) {}
      installEvt = null;
      return ui.onb ? renderOnb() : render();
    }
    if (a === "later") {
      ui.instLater = true;
      return render();
    }
    if (a === "share") {
      const url = new URL("installieren.html", location.href).href,
        I = t("inst");
      try {
        if (navigator.share)
          return await navigator.share({
            title: "Ringzeit",
            text: isTkdMain() ? I.shareTextTkd : isBoxMain() ? I.shareTextBox : I.shareText,
            url,
          });
      } catch (e) {
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast(I.copied);
      } catch (e) {
        prompt("", url);
      }
    }
  }

