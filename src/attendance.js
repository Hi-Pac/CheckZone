import { db, getServerTimestamp } from './firebaseConfig.js';
import { httpsCallable, getFunctions } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js';

const functions = getFunctions();
const verifyAndRecord = httpsCallable(functions, 'verifyAndRecord');

export async function processAttendance(coords, type) {
  try {
    await verifyAndRecord({ ...coords, type });
    return { success: true };
  } catch (e) {
    throw new Error(e.message);
  }
}
