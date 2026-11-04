/* Storage service: keeps the app state in the device's local storage under one key and – only when a cloud
   host is handed in – mirrors it to per-user documents. The service knows nothing about the shape of the app
   state; everything state-specific comes in through the hooks below.

   createStore({
     key,          storage key, e.g. "ringzeit-dev.v1"
     storage,      () => Storage   (called inside try: private modes may throw on access)
     getState,     () => object to save
     compact,      () => void      shrink the state once when storage is full (then one retry)
     onFull,       () => void      shown once when even the retry fails
     cloud,        () => host|null optional cloud host with host.use("db"|"user"); null/false = local only
     applyCloud,   (app, log) => void   copy loaded cloud documents (or null) into the app state
     cloudDocs,    () => ({ app, log }) documents to write (may trim the state first)
     onCloudLost,  () => void      the cloud refused writes; the app continues locally
   })
   The returned object keeps the former `store` interface: mode, readLocal, writeLocal, init, loadCloud, save,
   doc, put, flush, timer. */
export function createStore(o) {
  return {
    mode: "local",
    db: null,
    uid: null,
    chain: {},
    timer: null,
    readLocal() {
      try {
        const r = o.storage().getItem(o.key);
        return r ? JSON.parse(r) : null;
      } catch (e) {
        return null;
      }
    },
    writeLocal() {
      try {
        o.storage().setItem(o.key, JSON.stringify(o.getState()));
      } catch (e) {
        // storage full: shrink once and try again, otherwise warn (once)
        try {
          o.compact();
          o.storage().setItem(o.key, JSON.stringify(o.getState()));
        } catch (e2) {
          if (!this.warned) {
            this.warned = true;
            o.onFull();
          }
        }
      }
    },
    async init() {
      try {
        const host = o.cloud && o.cloud();
        if (!host || !host.use) return;
        const [db, user] = await Promise.all([host.use("db"), host.use("user")]);
        if (!db || !user) return;
        const id = await user.id();
        if (!id) return;
        this.db = db;
        this.uid = id;
        this.mode = "cloud";
      } catch (e) {
        this.mode = "local";
      }
    },
    doc(n) {
      return this.db.doc(`data/users/${this.uid}/${n}`);
    },
    async loadCloud() {
      if (this.mode !== "cloud") return false;
      try {
        const [a, l] = await Promise.all([this.doc("app").get(), this.doc("log").get()]);
        o.applyCloud(a.exists ? JSON.parse(JSON.stringify(a.data())) : null, l.exists ? JSON.parse(JSON.stringify(l.data())) : null);
        if (!a.exists && !l.exists) this.save(true);
        return true;
      } catch (e) {
        this.mode = "local";
        return false;
      }
    },
    save(now) {
      this.writeLocal();
      if (this.mode !== "cloud") return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flush(), now ? 0 : 700);
    },
    put(name, data) {
      const prev = this.chain[name] || Promise.resolve();
      const next = prev
        .then(() => this.doc(name).set(data))
        .catch((e) => {
          if (e && ["invalid_argument", "revoked", "not_granted"].includes(e.code)) {
            this.mode = "local";
            o.onCloudLost();
          }
        });
      this.chain[name] = next;
      return next;
    },
    flush() {
      const d = o.cloudDocs();
      this.put("app", d.app);
      this.put("log", d.log);
    },
  };
}
