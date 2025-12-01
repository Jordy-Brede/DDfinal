// Daily Dash IndexedDB setup
const DB_NAME = "daily-dash";
const DB_VERSION = 1;

let currentUserId = null;

export function setCurrentUserId(uid) {
  currentUserId = uid;
}

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;

      // Tasks
      if (!db.objectStoreNames.contains("tasks")) {
        const tasks = db.createObjectStore("tasks", { keyPath: "id" });
        tasks.createIndex("byUser", "userId");
        tasks.createIndex("byClientId", "clientId");
      }

      // Habits
      if (!db.objectStoreNames.contains("habits")) {
        const habits = db.createObjectStore("habits", { keyPath: "id" });
        habits.createIndex("byUser", "userId");
        habits.createIndex("byClientId", "clientId");
      }

      // Notes
      if (!db.objectStoreNames.contains("notes")) {
        const notes = db.createObjectStore("notes", { keyPath: "id" });
        notes.createIndex("byUser", "userId");
        notes.createIndex("byClientId", "clientId");
      }

      // Pending operations queue
      if (!db.objectStoreNames.contains("pendingOps")) {
        const ops = db.createObjectStore("pendingOps", {
          keyPath: "opId",
          autoIncrement: true
        });
        ops.createIndex("byUser", "userId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode, cb) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const result = cb(store);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
export async function putItem(store, item) {
  return tx(store, "readwrite", (s) => s.put(item));
}

export async function getItemsForUser(store, uid) {
  return tx(store, "readonly", (s) =>
    new Promise((resolve) => {
      const index = s.index("byUser");
      const req = index.getAll(uid);
      req.onsuccess = () => resolve(req.result || []);
    })
  );
}

export async function getItemByClientId(store, clientId) {
  return tx(store, "readonly", (s) =>
    new Promise((resolve) => {
      const index = s.index("byClientId");
      const req = index.get(clientId);
      req.onsuccess = () => resolve(req.result || null);
    })
  );
}

export async function deleteItem(store, id) {
  return tx(store, "readwrite", (s) => s.delete(id));
}

/*  Pending operations */
export async function enqueueOp(op) {
  return tx("pendingOps", "readwrite", (s) => s.add(op));
}

export async function getPendingOps(uid) {
  return tx("pendingOps", "readonly", (s) =>
    new Promise((resolve) => {
      const index = s.index("byUser");
      const req = index.getAll(uid);
      req.onsuccess = () => resolve(req.result || []);
    })
  );
}

export async function deleteOp(opId) {
  return tx("pendingOps", "readwrite", (s) => s.delete(opId));
}

export async function clearUserLocal() {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const t = db.transaction(["tasks", "habits", "notes", "pendingOps"], "readwrite");
    t.objectStore("tasks").clear();
    t.objectStore("habits").clear();
    t.objectStore("notes").clear();
    t.objectStore("pendingOps").clear();
    t.oncomplete = resolve;
    t.onerror = reject;
  });
}
