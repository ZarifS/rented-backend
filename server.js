const express = require("express");
const firebase = require("firebase");
const app = express();
const port = process.env.PORT || 8000;
var config = {
  apiKey: "AIzaSyBag4e7WLKhjPvZn6Sjvy3Qf7tmse5cRdQ",
  authDomain: "rented-project.firebaseapp.com",
  databaseURL: "https://rented-project.firebaseio.com",
  projectId: "rented-project",
  storageBucket: "rented-project.appspot.com",
  messagingSenderId: "426485648453"
};
firebase.initializeApp(config);
const auth = firebase.auth()

app.get("/api/hello", (req, res) => {
  res.send({express: "Hello From Express"});
});

app.get("/api/createUser", (req, res) => {
  const promise = auth.createUserWithEmailAndPassword(req.query.email, req.query.password);
  promise.then(user => {
    res.send({user});
  }).catch(e => {
    res.send({error: e.message});
  })
});

app.listen(port, () => console.log(`Listening on port ${port}`));
