const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = 'data.txt';

app.use(cors());
app.use(bodyParser.json());

// Legge il file degli utenti
function readUsers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf8').trim();
  return data ? JSON.parse(data) : [];
}

// Scrive gli utenti nel file
function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// **REGISTRAZIONE**
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ message: "Compila tutti i campi!" });
  }

  let users = readUsers();
  if (users.some(user => user.username === username)) {
    return res.json({ message: "Username già esistente!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  writeUsers(users);

  res.json({ message: "Registrazione avvenuta con successo!" });
});

// **LOGIN**
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let users = readUsers();
  const user = users.find(user => user.username === username);

  if (!user) {
    return res.json({ message: "Utente non trovato!" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (valid) {
    res.json({ success: true, message: "Login effettuato!" });
  } else {
    res.json({ success: false, message: "Password errata!" });
  }
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
