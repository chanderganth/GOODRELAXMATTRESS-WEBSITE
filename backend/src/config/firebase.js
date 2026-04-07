const admin = require('firebase-admin');

let db;

function initFirebase() {
  if (admin.apps.length > 0) return admin.app();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  return admin.app();
}

function getDb() {
  if (!db) {
    initFirebase();
    db = admin.firestore();
  }
  return db;
}

function getRealtimeDb() {
  initFirebase();
  return admin.database();
}

module.exports = { initFirebase, getDb, getRealtimeDb, admin };
