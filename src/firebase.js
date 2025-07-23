const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

// firebase is loaded globally by CDN script tags in index.html
if (!window.firebase.apps?.length) {
  window.firebase.initializeApp(firebaseConfig);
}

const db = window.firebase.firestore();
const firebase = window.firebase;

export { firebase, db };
