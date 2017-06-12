var firebase = require("firebase");

  // Leave out Storage
  //require("firebase/storage");

  var config = {
    apiKey: "AIzaSyBw70nL3K5HAhK8c27lh43-NoGXUg72ESY",
    authDomain: "dsdlfinal.firebaseapp.com",
    serviceAccount: "serviceAccountCredentials.json",
    databaseURL: "https://dsdlfinal.firebaseio.com",
    storageBucket: "",
  };
  var mainApp = firebase.initializeApp(config);
  var db = mainApp.database();
  var scoresRef = db.ref("scores");

  var updateScore = function(value, oncomplete) {
    scoresRef.push().update(value, oncomplete);
  };



module.exports = {
  "updateScore":updateScore,
  "scoresRef":scoresRef
};
