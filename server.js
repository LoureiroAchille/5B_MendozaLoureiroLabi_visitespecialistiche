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
    try {
        await database.insertPrenotazione(prenotazione);
        res.json({ result: "ok" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/prenotazioni", async (req, res) => {
    try {
        const list = await database.getAllPrenotazione();
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

const server = http.createServer(app);
const port = 5600;
server.listen(port, () => {
    console.log("- server running on port: " + port);
});
