const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const app = express()

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))
app.use(fileUpload());
app.use(express.static('public'));
app.use('/imageGallery', express.static('imageGallery'));

const jwtSecret = "secretodemais";
const saltRounds = 10;
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'imageGallery'
})

const verifyJWT = (req, res, next) => {
    const token = req.header("x-access-token")
    if (!token)
        res.send("No token sent from client")
    else{
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err)
                res.json({ auth: false });
            else {
                res.json({ auth: true });
                req.userId = decoded.id;
                next();
            }
        })
    }

}

app.get("/imageGallery/isUserAuth", verifyJWT, (req, res) => {
    res.send();
})

app.post("/imageGallery/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        const sqlQuery =
            "INSERT INTO userdatabase( username, password) VALUES (? , ?);"
        db.query(sqlQuery, [username, hash], (err, result) => {
            console.log(err);
        });
    })

})

app.post("/imageGallery/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sqlQuery =
        "SELECT * FROM userdatabase WHERE username = ?;"
    db.query(sqlQuery, [username], (err, result) => {
        if (err)
            res.send({ err: err });
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (error, response) => {
                if (response) {
                    const id = result[0].id;
                    const token = jwt.sign({ id }, jwtSecret, {
                        expiresIn: 500,
                    })
                    res.json({ auth: true, token: token, result: result });
                }
                else
                    res.json({ auth: false, result: result, message: "Wrong Username/Password combination!" });
            })
        }
        else
            res.json({ auth: false, result: result, message: "User doesnt exist" });
    })
});

app.get("/imageGallery/getList", (req, res) => {
    const sqlQuery =
        "SELECT * FROM imagelist";
    db.query(sqlQuery, (err, result) => {
        console.log(result);
        console.log(err);

        res.send(result);
    });
});

app.post("/imageGallery/uploadImage", verifyJWT, (req, res) => {
    let file;
    let genre;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    file = req.files.file;
    genre = req.body.genre;
    console.log(file)
    console.log(genre)
    // uploadPath = __dirname + '/imageGallery/' + file.name;

    // file.mv(uploadPath, (err) => {
    //     if (err)
    //         return res.status(500).send(err);

    //     const sqlQuery =
    //         "INSERT INTO imagelist( name, genre) VALUES (? , ?);"
    //     db.query(sqlQuery, [file.name, genre], (err, result) => {
    //         console.log(err);
    //     });
    //     res.send('File uploaded!');
    // });
});

app.listen(8000, () => {
    console.log("Server Running");
});

