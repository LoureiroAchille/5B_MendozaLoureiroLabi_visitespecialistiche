import { TabellaPrenotazioni,tipologiaSelez } from "./componenti.js";
export function login_fetch(username, password) {
    return new Promise((resolve, reject) => {
        fetch("./conf2.json")
            .then(r => r.json())
            .then(confData => {
                if (!confData.token) {
                    console.error("Token non trovato in ./conf2.json");
                    return;
                }

                
                return fetch("http://ws.cipiaceinfo.it/credential/login", { 
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "key": confData.token 
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
            })
            .then(r => r.json())
            .then(r => resolve(r.result)) 
            .catch(reject); 
    });
}
// Funzione per caricare le prenotazioni e le tipologie
export function loadBookings() {
    const diz = {}; // Mappa per le prenotazioni

    // Carica le tipologie
    fetch('/tipologie')
        .then(response => response.json())
        .then(tipologie => {
            console.log('Tipologie:', tipologie); // Verifica cosa ricevi

            const idToNameMapping = {};
            tipologie.forEach(tipologia => {
                idToNameMapping[tipologia.id] = tipologia.name; // Mappa idType a name
            });

            // Carica le prenotazioni
            fetch('/prenotazioni')
                .then(response => response.json())
                .then(data => {
                    // Popola il dizionario delle disponibilità con il nome del prenotante
                    data.forEach(prenotazione => {
                        const { type, date, hour, name } = prenotazione;
                        console.log("prenotazione: ", prenotazione);
                        if (type === undefined) {
                            console.error('idType non valido:', prenotazione);  // Stampa l'intero oggetto per capire meglio
                        }

                        if (type && date && hour) {
                            // Gestisci la data come stringa direttamente, senza usare moment.utc() o moment.local()
                            const formattedDate = date.split('T')[0];
                            const key = `${type}-${formattedDate}-${hour}`; // Usa direttamente la data formattata
                            if (tipologiaSelez === 0 || type === tipologiaSelez) { // Verifica la tipologia selezionata
                                diz[key] = name || 'Disponibile';
                            }
                        }
                    });

                    // Aggiorna la tabella passando la mappatura delle tipologie
                    const giorniSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
                    TabellaPrenotazioni({ tipologieVisita: idToNameMapping, diz, giorniSettimana });
                })
                .catch(error => {
                    console.error("Errore nel caricamento delle prenotazioni:", error);
                });
        })
        .catch(error => {
            console.error("Errore nel caricamento delle tipologie:", error);
        });
}











// Funzione per ottenere l'ID della tipologia
export function getTypeId(type) {
    const typeIds = {
        cardiology: 1,
        psychology: 2,
        oncology: 3,
        orthopedics: 4,
        neurology: 5
    };
    return typeIds[type] || null; // Restituisce l'ID corrispondente alla tipologia
}



