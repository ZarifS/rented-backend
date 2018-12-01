const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./secret-keys/rented-project-key.json");
const app = express();
const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const USERS = "users";

//Init Firebase ADMIN SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rented-project.firebaseio.com"
});
const db = admin.firestore();
const settings = {
  /* your settings... */
  timestampsInSnapshots: true
};
db.settings(settings);
const auth = admin.auth();

// Create User gets a email and password from the client and creates a firebase
// auth user. It then maps this user to the firestore users collection
app.post("/api/createUser", (req, res) => {
  auth
    .createUser(req.body)
    .then(userRecord => {
      addUserToDB(req.body, userRecord.uid);
      res.send({ uid: userRecord.uid });
    })
    .catch(e => {
      res.status(400).send({ error: e.message });
    });
});

//Get user by uid
app.get("/api/getUser/:uid", (req, res) => {
  const uid = req.params.uid;
  db.collection(USERS)
    .doc(uid)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).send({ error: "No such listing." });
      } else {
        res.send(doc.data());
      }
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
    });
});

//Get user by email and password
app.get("/api/getUser/:email/:password", (req, res) => {
  const { email, password } = req.params;
  db.collection(USERS);
});

//Update a user by id
app.patch("/api/updateUser/:uid", (req, res) => {
  let uid = req.params.uid;
  console.log(uid);
  let ref = db.collection("users").doc(uid);
  let userData = req.body;
  console.log(userData);
  ref
    .update(userData)
    .then(() => {
      res.send({ message: "Updated User!" });
    })
    .catch(e => {
      res.status(400).send({ error: e.message });
    });
});

//Add a new listing, body should include owner id
app.post("/api/addListing", (req, res) => {
  db.collection("listings")
    .add(req.body)
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
      res.send(docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
});

// Get all listings -> probably need to add a filter for location or something
// later
app.get("/api/getListings", (req, res) => {
  let listingsRef = db.collection("listings");
  let allListings = {};
  listingsRef.get().then(snapshot => {
    snapshot.forEach(doc => {
      let id = doc.id;
      let data = doc.data();
      allListings[id] = data;
    });
    res.send(allListings);
  });
});

//Get listing by listing id
app.get("/api/getListing/:listing_id", (req, res) => {
  const id = req.params.listing_id;
  let ref = db.collection("listings").doc(id);
  ref
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).send({ error: "No such listing." });
      } else {
        let id = doc.id;
        let data = {};
        data[id] = doc.data();
        res.send(data);
      }
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
    });
});

//Get listings belonging to a user (owner)
app.get("/api/getListings/:uid", (res, req) => {
  const uid = req.params.uid;
  let ref = db.collection("listings");
  ref
    .where("owner_id", "==", uid)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).send({ error: "No such listing." });
      } else {
        let id = doc.id;
        let data = {};
        data[id] = doc.data();
        res.send(data);
      }
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
    });
});

// Adds user to the firestore DB, seperate from the auth users firebase has.
// These users will have all our info needed.
function addUserToDB(user, uid) {
  //don't store their password
  delete user.password;
  db.collection("users")
    .doc(uid)
    .set(user)
    .catch(e => {
      //Handle Error
      console.log(e.message);
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
