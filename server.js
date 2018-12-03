const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./secret-keys/rented-project-key.json");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");

app.use(cors());
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
      const { uid } = userRecord;
      addUserToDB(req.body, uid, res);
    })
    .catch(e => {
      res.status(400).send({ error: e.message });
    });
});

//Get user by uid
app.get("/api/getUser/:uid", (req, res) => {
  let uid = req.params.uid;
  console.log(uid);
  let ref = db.collection("users").doc(uid);

  ref
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).send({ error: "No such user." });
      } else {
        res.send(doc.data());
      }
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
    });
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
  console.log("add listing");
  console.log("req.body: ");
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
  let allListings = [];
  listingsRef.get().then(snapshot => {
    snapshot.forEach(doc => {
      let listing_id = doc.id;
      let data = { ...doc.data() };
      data["listing_id"] = listing_id;
      allListings.push(data);
    });
    res.send(allListings);
  });
});

//Get listings belonging to a user (owner)
app.get("/api/getListings/:uid", (req, res) => {
  const uid = req.params.uid;

  let allListings = [];
  let ref = db.collection("listings");
  ref
    .where("owner_uid", "==", uid)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let listing_id = doc.id;
        let data = { ...doc.data() };
        data["listing_id"] = listing_id;
        allListings.push(data);
      });
      res.send(allListings);
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
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
        res.send(doc.data());
      }
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
    });
});

// Adds user to the firestore DB, seperate from the auth users firebase has.
// These users will have all our info needed.
function addUserToDB(user, uid, res) {
  //don't store their password
  delete user.password;
  db.collection("users")
    .doc(uid)
    .set(user)
    .then(() => {
      res.send({ uid: uid });
    })
    .catch(e => {
      //Handle Error
      console.log(e.message);
    });
}
// if the owner_id is equal to the current user_id then show update listing
// button should be done on the front end.
app.patch("/api/updateListing/:listing_id", (req, res) => {
  let listingID = req.params.listing_id;
  console.log(listingID);
  let ref = db.collection("listings").doc(listingID);
  let updateData = req.body;
  console.log(updateData);
  ref
    .update(updateData)
    .then(() => {
      res.send({ message: "Updated Listing!" });
    })
    .catch(e => {
      res.status(400).send({ error: e.message });
    });
});
// get visiting list for a given user_id passed in the parameter
app.get("/api/getVisitingList/:uid", (req, res) => {
  const uid = req.params.uid;
  console.log(uid);
  let allvisits = [];
  let ref = db.collection("visits");
  ref
    .where("user_id", "==", uid)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let id = doc.id;
        console.log(id);
        let data = doc.data();
        console.log(doc.data());
        allvisits.push(data);
      });
      res.send(allvisits);
    })
    .catch(err => {
      res.status(404).send({ error: err.message });
    });
});

app.post("/api/addToVisitingList", (req, res) => {
  db.collection("visits")
    .add(req.body)
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
      res.send(docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
});

app.delete("/api/deleteListing/:listing_id", (req, res) => {
  const deleteListing = req.params.listing_id;
  db.collection("listings")
    .doc(deleteListing)
    .delete()
    .then(function(docRef) {
      console.log(
        "Property with id " + deleteListing + " successfully deleted"
      );
      res.send("Property with id " + deleteListing + " successfully deleted");
    })
    .catch(function(error) {
      console.error("Error deleting listing: ", error);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
