import {
  subscribeItems,
  createItemRemote,
  updateItemRemote,
  deleteItemRemote
} from "./firebase.js";
import {
  putItem,
  deleteItem,
  enqueueOp,
  getPendingOps,
  deleteOp,
  getItemsForUser,
  getItemByClientId
} from "./idb.js";

let unsubTasks = null;
let unsubHabits = null;
let unsubNotes = null;

export async function hydrateFromRemote(uid) {
  const tasks = await getItemsForUser("tasks", uid);
  const habits = await getItemsForUser("habits", uid);
  const notes = await getItemsForUser("notes", uid);
  renderList("task", tasks);
  renderList("habit", habits);
  renderList("note", notes);
}

export function startRealtime(uid) {
  if (unsubTasks) unsubTasks();
  if (unsubHabits) unsubHabits();
  if (unsubNotes) unsubNotes();

  unsubTasks = subscribeItems(uid, "task", async (snapshot) => {
    const batch = [];
    snapshot.docChanges().forEach((change) => {
      const id = change.doc.id;
      const data = change.doc.data();
      batch.push({ id, ...data });
    });
    for (const item of batch) {
      await putItem("tasks", item);
    }
    renderList("task", await getItemsForUser("tasks", uid));
  });

  unsubHabits = subscribeItems(uid, "habit", async (snapshot) => {
    const batch = [];
    snapshot.docChanges().forEach((change) => {
      const id = change.doc.id;
      const data = change.doc.data();
      batch.push({ id, ...data });
    });
    for (const item of batch) {
      await putItem("habits", item);
    }
    renderList("habit", await getItemsForUser("habits", uid));
  });

  unsubNotes = subscribeItems(uid, "note", async (snapshot) => {
    const batch = [];
    snapshot.docChanges().forEach((change) => {
      const id = change.doc.id;
      const data = change.doc.data();
      batch.push({ id, ...data });
    });
    for (const item of batch) {
      await putItem("notes", item);
    }
    renderList("note", await getItemsForUser("notes", uid));
  });
}

export async function syncPendingOps(uid) {
  const ops = await getPendingOps(uid);
  for (const op of ops.sort((a, b) => a.ts - b.ts)) {
    try {
      if (op.type === "create") {
        const existing = await getItemByClientId(op.store, op.payload.clientId);
        if (existing && !existing.id.startsWith("temp-")) {
          await deleteOp(op.opId);
          continue;
        }
        const newId = await createItemRemote(uid, op.store.slice(0, -1), op.payload);
        await deleteItem(op.store, op.payload.id); 
        await putItem(op.store, { ...op.payload, id: newId, userId: uid });
      } else if (op.type === "update") {
        await updateItemRemote(uid, op.store.slice(0, -1), op.payload.id, op.payload);
      } else if (op.type === "delete") {
        await deleteItemRemote(uid, op.store.slice(0, -1), op.payload.id);
      }
      await deleteOp(op.opId);
    } catch (e) {
      console.warn("Sync failed, will retry later", e);
      break; 
    }
  }
}

function renderList(type, items) {
  let container;
  if (type === "task") container = document.getElementById("task-list");
  if (type === "habit") container = document.getElementById("habit-list");
  if (type === "note") container = document.getElementById("notes-list");
  if (!container) return;

  container.innerHTML = "";

  if (type === "task") {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "collection-item";
      li.innerHTML = `
        <span>${item.title}</span>
        ${item.due ? `<span class="badge grey lighten-2 grey-text text-darken-1">Due: ${item.due}</span>` : ""}
        <a href="#!" class="secondary-content"><i class="material-icons task-complete">check_circle_outline</i></a>
      `;
      container.appendChild(li);
    });
  }

  if (type === "habit") {
    items.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col s12 m6";
      col.innerHTML = `
        <div class="card habit-card">
          <div class="card-content">
            <span class="card-title">${item.title}</span>
            <p>${item.frequency}</p>
          </div>
          <div class="card-action">
            <a href="#!" class="habit-toggle">Mark today</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  if (type === "note") {
    items.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col s12 m6";
      col.innerHTML = `
        <div class="card">
          <div class="card-content">
            <span class="card-title">${item.title || "Note"}</span>
            <p>${item.text}</p>
          </div>
          <div class="card-action">
            <a href="#!" class="note-delete">Delete</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }
}
