const express = require("express");
const firebase = require("firebase");
const app = express();
const port = process.env.PORT || 8000;

//Init Firebase
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

// API Routes
app.post("/api/createUser", (req, res, next) => {
  const promise = auth.createUserWithEmailAndPassword(req.query.email, req.query.password);
  promise.then(user => {
    res.send({user});
  }).catch(e => {
    res
      .status(400)
      .send({error: e})
  })
});

app.get("/api/signInUser", (req, res) => {
  const promise = auth.signInWithEmailAndPassword(req.query.email, req.query.password);
  promise.then(user => {
    res.send({user});
  }).catch(e => {
    res
      .status(403)
      .send({error: e})
  })
})

app.listen(port, () => console.log(`Listening on port ${port}`));
