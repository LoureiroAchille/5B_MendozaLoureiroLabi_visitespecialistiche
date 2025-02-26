const fs = require('fs');
const mysql = require('mysql2');

let conf = JSON.parse(fs.readFileSync('public/conf.json'));
conf.ssl = {
    ca: fs.readFileSync(__dirname + '/ca.pem')
};

const connection = mysql.createConnection(conf);

const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const database = {
    createTables: async () => {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS type (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(20)
                )
            `);
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS booking (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    idType INT NOT NULL,
                    date DATE NOT NULL,
                    hour INT NOT NULL,
                    name VARCHAR(50),
                    FOREIGN KEY (idType) REFERENCES type(id)
                )
            `);
        } catch (error) {
            console.error("Errore nella creazione delle tabelle:", error);
        }
    },

    insertPrenotazione: (booking) => {
        const idType = booking.idType;
        const date = booking.date;
        const hour = booking.hour;
        const name = booking.name;
    
        const sql = `
            INSERT INTO booking (idType, date, hour, name) 
            VALUES (${idType}, '${date}', ${hour}, '${name}')
        `;
    
        return executeQuery(sql);
    },
    

    getAllPrenotazione: () => {
        const sql = `
            SELECT b.id, t.name AS type, b.date, b.hour, b.name
            FROM booking AS b
            JOIN type AS t ON b.idType = t.id
        `;
        return executeQuery(sql);
    },

    getPrenotazioneData: (date) => {
        const sql = `
            SELECT b.id, t.name AS type, b.date, b.hour, b.name
            FROM booking AS b
            JOIN type AS t ON b.idType = t.id
            WHERE b.date = ?
        `;
        return executeQuery(sql, [date]);
    },
    getAllTipologie() {
        const sql = `SELECT id, name FROM type`;
        return executeQuery(sql);
      }
};

module.exports = database;
