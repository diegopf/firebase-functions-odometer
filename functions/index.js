const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const firestore = admin.firestore();

const tripsDocuments = "/history/trips/{userId}/{tripId}";

exports.calculateTotal = functions.firestore
  .document(tripsDocuments)
  .onCreate(ev => {
    const document = ev.data();
    return firestore
      .collection(`/history/trips/${document.userId}`)
      .get()
      .then(data => {
        const docs = [];
        data.forEach(d => docs.push(d.data()));
        const totalDistance = docs
          .map(d => d.distance)
          .reduce((a, b) => (a += b));
        const totalTrips = docs.length;
        return firestore
          .collection("/stats")
          .doc(document.userId)
          .set({ totalDistance, totalTrips });
      })
      .catch(error => {
        console.error(error);
      });
  });
