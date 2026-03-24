import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBz3vodmnTMHpTJ1fXcmjOnmfgU0DkqnIo",
  authDomain: "attendance-fd328.firebaseapp.com",
  projectId: "attendance-fd328",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const getServerTimestamp = () => serverTimestamp();
