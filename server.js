const express = require("express")
const bodyParser = require('body-parser');
const admin = require("firebase-admin")
const serviceAccount = require('./secret-keys/rented-project-key.json');
const app = express()
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
const port = process.env.PORT || 8000

//Init Firebase ADMIN SDK
admin.initializeApp({
  credential: admin
    .credential
    .cert(serviceAccount),
  databaseURL: 'https://rented-project.firebaseio.com'
});
const db = admin.firestore()
const auth = admin.auth()

// Create User gets a email and password from the client and creates a firebase
// auth user. It then maps this user to the firestore users collection
app.post('/api/createUser', (req, res) => {
  auth
    .createUser(req.body)
    .then((userRecord) => {
      addUserToDB(req.body, userRecord.uid)
      res.send({uid: userRecord.uid})
    })
    .catch((e) => {
      res
        .status(400)
        .send({error: e.message})
    })
});

// Updates a user given a uid. The way the update works is it either adds new
// fields, or updates existing ones. Hence a patch.
app.patch('/api/updateUser/:uid', (req, res) => {
  const uid = req.params.uid;
  console.log(uid)
  const ref = db
    .collection('users')
    .doc(uid)
  const userData = req.body;
  console.log(userData)
  ref
    .update(userData)
    .then(() => {
      res.send({message: 'Updated User!'})
    })
    .catch((e) => {
      res
        .status(400)
        .send({error: e.message})
    })
})

// Adds user to the firestore DB, seperate from the auth users firebase has.
// These users will have all our info needed.
function addUserToDB(user, uid) {
  //don't store their password
  delete user.password
  db
    .collection('users')
    .doc(uid)
    .set(user)
    .catch((e) => {
      //Handle Error
      console.log(e.message)
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`))
