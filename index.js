const express = require("express")
const dotenv = require("dotenv")
const bodyparser = require("body-parser")
const path = require('path')
const { initializeApp } = require("firebase/app")
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth")
const { getDatabase, ref, set, get } = require("firebase/database");

const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: "krishi-connect12.appspot.com",
    messagingSenderId: "44448474566",
    appId: "1:44448474566:web:93807fd8396b0157bebec7",
    measurementId: "G-J138W8N9ZF"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "views", "landingPage.html"));
});

app.get("/form", function (req, res) {
    res.sendFile(path.join(__dirname, "views", "form.html"));
});

app.get("/farmerpage", function (req, res) {
    res.sendFile(path.join(__dirname, "views", "farmerpage.html"));
})

app.get("/wholesaler", function (req, res) {
    res.sendFile(path.join(__dirname, "views", "wholesaler.html"));
})


app.get("/getFarmersData", (req, res) => {
    const dbRef = ref(db, "wholesaler");

    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                res.json(snapshot.val());
            } else {
                res.status(404).json({ message: "No farmer data available" });
            }
        })
        .catch((error) => {
            console.error("Error fetching data from Firebase:", error); // Log the actual error for debugging
            res.status(500).json({ error: "Error fetching farmer data" });
        });
});

app.get("/getwholesalerData", (req, res) => {
    const dbRef = ref(db, "farmer");

    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                res.json(snapshot.val());
            } else {
                res.status(404).json({ message: "No wholesaler data available" });
            }
        })
        .catch((error) => {
            console.error("Error fetching data from Firebase:", error); // Log the actual error for debugging
            res.status(500).json({ error: "Error fetching farmer data" });
        });
});

app.post("/form", function (req, res) {
    const userType = req.body.userType;
    const name = req.body.name;
    const email = req.body.email;
    const investment_amt = req.body.investment;
    const cropname = req.body.cropname;
    const aboutme = req.body.aboutme;

    try {
        set(ref(db, userType + "/" + name), {
            name: name,
            email: email,
            investment_amt: investment_amt,
            cropname: cropname,
            aboutme: aboutme
        }).then(() => {
            if (userType === "farmer") {
                res.redirect("/farmerpage")
            } else {
                res.redirect("/wholesaler")
            }
        }).catch((dbError) => {
            console.error("Database error:", dbError);
            res.status(500).send("Error storing data.");
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Server error.");
    }
});

app.post('/signup', function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                res.redirect("/form")
            })
    } catch (authError) {
        console.error("Error creating user:", authError);
        res.status(400).send("Error: " + authError.message);
    }
});


app.post("/signin", function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                res.redirect("/form")
            })
    } catch (authError) {
        console.error("Error creating user:", authError);
        res.status(400).send("Error: " + authError.message);
    }

})

app.listen(process.env.PORT, function (req, res) {
    console.log(process.env.PORT);
})