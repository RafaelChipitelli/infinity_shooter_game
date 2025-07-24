const firebaseConfig = {
  apiKey: "AIzaSyDTJSH0WFZIZ77tXonpePM_k7Q3nbduSY0",
  authDomain: "bulletrush-fun.firebaseapp.com",
  projectId: "bulletrush-fun",
  storageBucket: "bulletrush-fun.firebasestorage.app",
  messagingSenderId: "23163026813",
  appId: "1:23163026813:web:e6ffd29924e2fac884e014"
};

// firebase is loaded globally by CDN script tags in index.html
if (!window.firebase.apps?.length) {
  window.firebase.initializeApp(firebaseConfig);
}

const db = window.firebase.firestore();
const firebase = window.firebase;

export { firebase, db };
