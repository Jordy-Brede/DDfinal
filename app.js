import { auth } from "./firebase.js";
import { putItem, deleteItem, enqueueOp } from "./idb.js";
import { syncPendingOps } from "./sync.js";


document.addEventListener("DOMContentLoaded", () => {
  const selects = document.querySelectorAll("select");
  M.FormSelect.init(selects);

  const tabs = document.querySelectorAll(".tabs");
  M.Tabs.init(tabs);
});

/* Service Worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
   navigator.serviceWorker.register("public/sw.js");
  });
}

/* Install Prompt */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("install-btn");
  btn.classList.remove("hide");
  btn.addEventListener("click", async () => {
    btn.classList.add("hide");
    await deferredPrompt.prompt();
    deferredPrompt = null;
  });
});

/* Offline Banner */
function setOfflineBanner(offline) {
  const banner = document.getElementById("offline-banner");
  if (offline) banner.classList.remove("hide");
  else banner.classList.add("hide");
}
window.addEventListener("online", async () => {
  setOfflineBanner(false);
  const uid = auth.currentUser?.uid;
  if (uid) await syncPendingOps(uid);
});
window.addEventListener("offline", () => setOfflineBanner(true));
setOfflineBanner(!navigator.onLine);

/* Render helpers */
export async function renderAppForUser(uid) {
}
export function renderSignedOut() {
  document.getElementById("app-section").classList.add("hide");
}

/* Tasks */
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title").value.trim();
  const due = document.getElementById("task-due").value;
  if (!title) {
    M.toast({ html: "Enter a task title", classes: "red" });
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    M.toast({ html: "Please sign in", classes: "red" });
    return;
  }

  const uid = user.uid;
  const clientId = crypto.randomUUID();
  const localId = `temp-${clientId}`;
  const item = { id: localId, clientId, userId: uid, title, due, updatedAt: Date.now() };

  await putItem("tasks", item);
  await enqueueOp({ userId: uid, store: "tasks", type: "create", payload: item, ts: Date.now() });
  if (navigator.onLine) await syncPendingOps(uid);

  taskForm.reset();
  M.updateTextFields();
  M.toast({ html: "Task added", classes: "green" });
});

taskList.addEventListener("click", async (e) => {
  const icon = e.target.closest(".task-complete");
  if (!icon) return;
  const li = icon.closest(".collection-item");
  li.classList.toggle("grey-text");
  icon.textContent = icon.textContent === "check_circle_outline" ? "check_circle" : "check_circle_outline";
});

/* Habits */
const habitForm = document.getElementById("habit-form");
const habitList = document.getElementById("habit-list");

habitForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("habit-title").value.trim();
  const frequency = document.getElementById("habit-frequency").value;
  if (!title) {
    M.toast({ html: "Enter a habit name", classes: "red" });
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    M.toast({ html: "Please sign in", classes: "red" });
    return;
  }

  const uid = user.uid;
  const clientId = crypto.randomUUID();
  const localId = `temp-${clientId}`;
  const item = { id: localId, clientId, userId: uid, title, frequency, updatedAt: Date.now() };

  await putItem("habits", item);
  await enqueueOp({ userId: uid, store: "habits", type: "create", payload: item, ts: Date.now() });
  if (navigator.onLine) await syncPendingOps(uid);

  habitForm.reset();
  M.updateTextFields();
  M.toast({ html: "Habit added", classes: "green" });
});

habitList.addEventListener("click", async (e) => {
  const toggle = e.target.closest(".habit-toggle");
  if (!toggle) return;
  M.toast({ html: "Habit marked for today", classes: "blue" });
});

/* Notes */
const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("note-text").value.trim();
  if (!text) {
    M.toast({ html: "Write something first", classes: "red" });
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    M.toast({ html: "Please sign in", classes: "red" });
    return;
  }

  const uid = user.uid;
  const clientId = crypto.randomUUID();
  const localId = `temp-${clientId}`;
  const item = { id: localId, clientId, userId: uid, text, updatedAt: Date.now() };

  await putItem("notes", item);
  await enqueueOp({ userId: uid, store: "notes", type: "create", payload: item, ts: Date.now() });
  if (navigator.onLine) await syncPendingOps(uid);

  noteForm.reset();
  M.toast({ html: "Note saved", classes: "green" });
});

notesList.addEventListener("click", async (e) => {
  const del = e.target.closest(".note-delete");
  if (!del) return;
  const card = del.closest(".col");
  card.remove();
  M.toast({ html: "Note deleted", classes: "grey" });
});

