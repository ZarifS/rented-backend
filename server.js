const express = require("express");
const firebase = require("firebase");
const app = express();
const port = process.env.PORT || 8000;
app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

app.get("/api/addUser", (req, res) => {
  writeUserData(req.query.userId, req.query.name, req.query.email).then(() => {
    res.send({ express: "Added User!" });
  });
});

var config = {
  apiKey: "AIzaSyBag4e7WLKhjPvZn6Sjvy3Qf7tmse5cRdQ",
  authDomain: "rented-project.firebaseapp.com",
  databaseURL: "https://rented-project.firebaseio.com",
  projectId: "rented-project",
  storageBucket: "rented-project.appspot.com",
  messagingSenderId: "426485648453"
};

firebase.initializeApp(config);
const database = firebase.database();

async function writeUserData(userId, name, email) {
  firebase
    .database()
    .ref("users/" + userId)
    .set({ username: name, email: email });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
