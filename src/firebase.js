import 'dotenv/config';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

firebase.initializeApp(config);

const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;

export { db, FieldValue, firebase };
