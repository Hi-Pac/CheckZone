const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const companyLocation = { lat:30.8087063, lon:31.0030066, radius:25 };
function calcDist(lat1, lon1, lat2, lon2) {
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

exports.verifyAndRecord = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','');
  const { latitude, longitude, type } = data;
  if (calcDist(latitude, longitude, companyLocation.lat, companyLocation.lon) > companyLocation.radius) {
    throw new functions.https.HttpsError('permission-denied','خارج النطاق');
  }
  await admin.firestore().collection('attendance').add({
    uid: context.auth.uid,
    type,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  return { ok: true };
});
