const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const database = require("./database");

const app = express();
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));

database.createTables();

app.post("/insert", async (req, res) => {
    const prenotazione = req.body;
    console.log("Dati ricevuti:", prenotazione); // Aggiungi questo per vedere cosa arriva
    try {
        await database.insertPrenotazione(prenotazione);
        res.json({ result: "ok" });
    } catch (e) {
        console.error("Errore durante l'inserimento:", e);
        res.status(500).json({ error: e.message });
    }
});


app.get("/prenotazioni", async (req, res) => {
    try {
        const list = await database.getAllPrenotazione();
        console.log("Dati ricevuti:", list);
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/booking/:date", async (req, res) => {
    const date = req.params.date;
    try {
        const list = await database.getPrenotazioneData(date);
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/tipologie', async (req, res) => {
    try {
      // Non usi più "connection.execute", ma la tua funzione:
      const rows = await database.getAllTipologie();
      res.json(rows);
    } catch (error) {
      console.error("Errore nel recupero delle tipologie:", error);
      res.status(500).json({ error: "Errore nel recupero delle tipologie" });
    }
  });
  

const server = http.createServer(app);
const port = 5600;
server.listen(port, () => {
    console.log("- server running on port: " + port);
});
