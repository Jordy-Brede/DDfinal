# DailyDash — PWA Prototype

DailyDash is a Progressive Web App (PWA) designed to help users track daily tasks, habits, and quick notes. The app works offline, syncs tasks to Firebase when online, and can be installed on both mobile and desktop devices.

---

## Features

- **Task Management:** Add, complete, and delete tasks.
- **Habit Tracking:** Track daily habits with checkboxes and remove habits.
- **Quick Notes:** Save quick notes locally for reference.
- **Offline-First:** Fully functional offline using IndexedDB.
- **Firebase Sync:** Offline tasks automatically sync to Firebase Firestore when online.
- **Installable PWA:** Installable on mobile or desktop through the "Install" button.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **UI Framework:** Materialize CSS
- **Cloud Storage:** Firebase Firestore
- **Offline Storage:** IndexedDB
- **Service Worker:** Offline caching and PWA support
- **Manifest:** PWA installation support

## How It Works

### Online Mode
- User logs in using Firebase Authentication
- Tasks sync to Firebase Firestore
- Tasks filtered by user (userId)

### Offline Mode
- Tasks save into IndexedDB
- App loads offline using service worker
- When back online → IndexedDB tasks sync automatically to Firebase

## How to use

#1 Clone repo 
#2 Install dependencies 
#3 Configure firebase 

apiKey: "AIzaSyCKfbYs7QwgMUEWntk0PPCznkGnRnYXdkA",
  authDomain: "dailydash123.firebaseapp.com",
  projectId: "dailydash123",
  storageBucket: "dailydash123.firebasestorage.app",
  messagingSenderId: "915719372363",
  appId: "1:915719372363:web:397192cb5e2cbe602e57ce"  
  
#4 Run locally 
#5 Deploy to Firebase Hosting

Project structure: daily-dash/

├── index.html        # Main entry point
├── styles.css        # Orange theme styles
├── firebase.js       # Firebase config
├── auth.js           # Authentication logic
├── app.js            # UI + app logic
├── sync.js           # Firestore sync
├── idb.js            # IndexedDB helpers
├── sw.js             # Service worker
└── manifest.json     # PWA manifest


