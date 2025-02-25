// server.js (Backend Node.js con Express)
const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per gestire i dati JSON e abilitare CORS
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Cartella con HTML, CSS, JS

const DATA_FILE = path.join(__dirname, "data.txt");

// Funzione per leggere il file data.txt
const readUsers = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return data.split("\n").filter(line => line).map(line => {
        const [username, password] = line.split(":");
        return { username, password };
    });
};

// Funzione per salvare un nuovo utente
const saveUser = (username, passwordHash) => {
    fs.appendFileSync(DATA_FILE, `${username}:${passwordHash}\n`);
};

// Route per registrarsi
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Dati mancanti" });
    
    const users = readUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "Username già in uso" });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    saveUser(username, passwordHash);
    res.json({ message: "Registrazione completata" });
});

// Route per il login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenziali errate" });
    }
    res.json({ message: "Login riuscito", username });
});

app.listen(PORT, () => console.log(`Server attivo su https://devid-9bxj.onrender.com`));

// Aggiornamento HTML e client-side
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("auth-form");
    const messageBox = document.getElementById("message");
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const action = document.querySelector("input[name='action']:checked").value;
        
        const endpoint = action === "register" ? "/register" : "/login";
        
        try {
            const response = await fetch(`https://devid-9bxj.onrender.com${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            messageBox.textContent = data.message || data.error;
            
            if (response.ok && action === "login") {
                sessionStorage.setItem("username", username);
                window.location.href = "home.html"; // Reindirizza alla pagina principale dopo il login
            }
        } catch (error) {
            console.error("Errore nella richiesta:", error);
        }
    });
});
