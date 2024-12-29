const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "db.json");

app.use(express.json());

// Helper para leer y escribir en el archivo JSON
function readDatabase() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

app.get("/users", (req, res) => {
  const db = readDatabase();
  res.json(db.users);
});

app.get("/users/:id", (req, res) => {
  console.log(`Received request for ID: ${req.params.id}`);
  const db = readDatabase();
  const userId = parseInt(req.params.id, 10);
  const user = db.users.find((user) => user.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
});

app.get("/users/account/:account_number", (req, res) => {
  const db = readDatabase();
  const accountNumber = req.params.account_number;
  const user = db.users.find((user) => user.account_number === accountNumber);

  if (!user) {
    return res.status(400).json({ message: "No se encontro ningun usuario con ese numero de cuenta" });
  }

  res.status(200).json(user);
});

app.post("/users", (req, res) => {
  const db = readDatabase();
  const newUser = {
    id: db.users.length ? db.users[db.users.length - 1].id + 1 : 1,
    ...req.body,
  };
  db.users.push(newUser);
  writeDatabase(db);
  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const db = readDatabase();
  const userId = parseInt(req.params.id, 10);
  const userIndex = db.users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  db.users[userIndex] = { ...db.users[userIndex], ...req.body };
  writeDatabase(db);
  res.json(db.users[userIndex]);
});

app.delete("/users/:id", (req, res) => {
  const db = readDatabase();
  const userId = parseInt(req.params.id, 10);
  const newUsers = db.users.filter((user) => user.id !== userId);

  if (db.users.length === newUsers.length) {
    return res.status(404).json({ error: "User not found" });
  }

  db.users = newUsers;
  writeDatabase(db);
  res.status(204).send();
});

// Server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
