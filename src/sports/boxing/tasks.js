/* Task sparring for boxing (Aufgabensparring), same shape as the kickboxing tasks:
   de/en = [title, partner text, solo text (null = partner only)]. sport: "boxing" keeps them apart from the kickboxing
   tasks. lvl = minimum level, gear = needs a partner and full protection, light = allowed in taper/recovery weeks and
   exam preparation. Restrictions that hold for A and B alike are in the text. Pure data. */
export const BOX_TASKS = [
  {
    id: "bx_lead", sport: "boxing", light: true,
    de: ["Nur Führhand", "Beide boxen nur mit der Führhand: Jab, Führhaken, Abstand und Beinarbeit. Kontrolliert, kein Schlag mit Wucht.", "Nur Jab und Führhand mit Beinarbeit gegen einen vorgestellten Gegner."],
    en: ["Lead hand only", "Both box with the lead hand only: jab, lead hook, distance and footwork. Controlled, nothing with force.", "Jab and lead hand only, with footwork against an imagined opponent."],
  },
  {
    id: "bx_attdef", sport: "boxing", light: true,
    de: ["Angriff & Verteidigung", "A greift an, B verteidigt nur mit Meiden, Parieren und Beinarbeit. Nach 3–5 Aktionen Rollen tauschen.", "Greife einen vorgestellten Gegner an, dann verteidige gegen seine Antwort: Meiden und Beinarbeit."],
    en: ["Attack & defence", "A attacks, B defends only with slips, parries and footwork. Swap roles every 3–5 exchanges.", "Attack an imagined opponent, then defend against his answer: slips and footwork."],
  },
  {
    id: "bx_counter", sport: "boxing", light: true, lvl: 1,
    de: ["Konter nach Meiden", "A greift an, B meidet (Abtauchen, Parieren) und kontert sofort. Nach 3–5 Aktionen tauschen.", "Stell dir einen Angriff vor: meiden, dann sofort kontern."],
    en: ["Counter after slipping", "A attacks, B slips or parries and counters straight away. Swap every 3–5 exchanges.", "Picture an attack: slip or parry, then counter straight away."],
  },
  {
    id: "bx_bodyhead", sport: "boxing", light: true,
    de: ["Körper, dann Kopf", "Erst zum Körper, dann zum Kopf – zum Beispiel Körperhaken, dann Führhaken. Kontrolliert.", "Erst zum Körper, dann zum Kopf – zum Beispiel Körperhaken, dann Führhaken."],
    en: ["Body, then head", "Body first, then head – e.g. body hook, then lead hook. Controlled.", "Body first, then head – e.g. body hook, then lead hook."],
  },
  {
    id: "bx_pressure", sport: "boxing", lvl: 1,
    de: ["Druck & Rückwärts", "A macht Druck nach vorn, B arbeitet rückwärts und seitlich mit Jab und Beinarbeit. Nach 3–5 Aktionen tauschen.", "Abwechselnd 20 s nach vorn drücken und 20 s rückwärts mit Jab und Seitschritten arbeiten."],
    en: ["Pressure & retreat", "A pushes forward, B moves back and sideways with the jab and footwork. Swap every 3–5 exchanges.", "Alternate 20 s pressing forward and 20 s moving back with the jab and side steps."],
  },
  {
    id: "bx_corner", sport: "boxing", lvl: 1,
    de: ["Raus aus der Ecke", "B startet in der Ringecke und befreit sich mit Beinarbeit und Konter. Danach tauschen.", null],
    en: ["Out of the corner", "B starts in the ring corner and escapes with footwork and counters. Then swap.", null],
  },
  {
    id: "bx_halfdist", sport: "boxing", lvl: 1,
    de: ["Halbdistanz", "Arbeit auf kurzer Distanz mit Haken und Uppercuts, ohne Festhalten (kein Clinch). Nach jeder Aktion lösen und Abstand herstellen.", null],
    en: ["Half distance", "Work at short range with hooks and uppercuts, no holding (no clinch). Break off and reset after every exchange.", null],
  },
  {
    id: "bx_first", sport: "boxing", light: true, lvl: 1,
    de: ["Erster Treffer", "Der erste saubere Treffer zählt – kurz trennen, neu beginnen. Leichter Kontakt, wer hat am Ende der Runde mehr?", null],
    en: ["First clean hit", "The first clean hit scores – break, then restart. Light contact, who has more at the end of the round?", null],
  },
  {
    id: "bx_free", sport: "boxing", lvl: 1, gear: true, touch: true,
    de: ["Freies Touch-Sparring", "Frei boxen mit höchstens 30–40 % Schlaghärte, Partner und volle Schutzausrüstung. Freies Sparring nur nach Absprache mit deinem Trainer und unter Aufsicht.", null],
    en: ["Free touch sparring", "Box freely at no more than 30–40 % hitting power, with a partner and full protective gear. Free sparring only in agreement with your coach and under supervision.", null],
  },
];
