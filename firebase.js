// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export const firebaseApp = initializeApp({
 apiKey: "AIzaSyCKfbYs7QwgMUEWntk0PPCznkGnRnYXdkA",
  authDomain: "dailydash123.firebaseapp.com",
  projectId: "dailydash123",
  storageBucket: "dailydash123.firebasestorage.app",
  messagingSenderId: "915719372363",
  appId: "1:915719372363:web:397192cb5e2cbe602e57ce"    

});

// Auth setup
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export async function initAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

// Auth helpers
export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function signInGoogle() {
  return signInWithPopup(auth, googleProvider);
}
export async function signOutUser() {
  return signOut(auth);
}

// Firestore setup
export const db = getFirestore(firebaseApp);

// Collections
export function tasksCollection(uid) {
  return collection(db, "users", uid, "tasks");
}
export function habitsCollection(uid) {
  return collection(db, "users", uid, "habits");
}
export function notesCollection(uid) {
  return collection(db, "users", uid, "notes");
}

// Queries
export function tasksQuery(uid) {
  return query(tasksCollection(uid), orderBy("updatedAt", "desc"));
}
export function habitsQuery(uid) {
  return query(habitsCollection(uid), orderBy("updatedAt", "desc"));
}
export function notesQuery(uid) {
  return query(notesCollection(uid), orderBy("updatedAt", "desc"));
}

export async function createItemRemote(uid, type, payload) {
  let col;
  if (type === "task") col = tasksCollection(uid);
  if (type === "habit") col = habitsCollection(uid);
  if (type === "note") col = notesCollection(uid);

  const docRef = await addDoc(col, {
    ...payload,
    userId: uid,
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateItemRemote(uid, type, id, payload) {
  let path = `users/${uid}/${type}s/${id}`;
  await setDoc(doc(db, path), {
    ...payload,
    userId: uid,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteItemRemote(uid, type, id) {
  let path = `users/${uid}/${type}s/${id}`;
  await deleteDoc(doc(db, path));
}
export function subscribeItems(uid, type, handler) {
  let q;
  if (type === "task") q = tasksQuery(uid);
  if (type === "habit") q = habitsQuery(uid);
  if (type === "note") q = notesQuery(uid);
  return onSnapshot(q, handler);
}
