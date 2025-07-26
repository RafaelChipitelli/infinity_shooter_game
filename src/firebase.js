import 'dotenv/config';

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID,
};
// firebase is loaded globally by CDN script tags in index.html
if (!window.firebase.apps?.length) {
  window.firebase.initializeApp(firebaseConfig);
}

const firebase = window.firebase;
const db = firebase.firestore();
const auth = firebase.auth();

export { firebase, db, auth };
