import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

// ------------ MYSQL --------------
const con = mysql.createConnection({
  host: "localhost",
  user: "",
  password: "",
  database: "puhelinluettelo",
  multipleStatements: true,
});

con.connect((err) => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  }
  console.log("Connection established");
});

// ------------ Routes --------------
app.get("/users", (req, res) => {
  con.query("SELECT * FROM henkilot", (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  con.query(`CALL sp_get_henkilon_tiedot(${id})`, (err, rows) => {
    if (err) throw err;
    res.json(rows[0]);
  });
});

app.post("/users", (req, res) => {
  const henkilo = req.body;
  con.query("INSERT INTO henkilot SET ?", henkilo, (err, res) => {
    if (err) throw err;
    res.json(henkilo);
  });
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const puhelin = req.body;
  con.query(
    "UPDATE henkilot SET puhelin = ? Where ID = ?",
    [puhelin, id],
    (err, result) => {
      if (err) throw err;
      res.send(`Changed ${result.changedRows} row(s)`);
    }
  );
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  con.query("DELETE FROM henkilot WHERE id = ?", [id], (err, result) => {
    if (err) throw err;
    res.send(`Deleted ${result.affectedRows} row(s)`);
  });
});

// ------------------- CORS ---------------
// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.listen(5000, () => {
  console.log("Server running on port: http://localhost:5000/");
});
