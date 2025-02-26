import {login_fetch,getTypeId,loadBookings} from "./function.js"

let currentWeekOffset = 0;
export let tipologiaSelez = 0;
let giorniSettimana = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
let tipologieVisita = {}; 
let diz = {}; 
window.selectTipologia = selectTipologia;

const tableContainer = document.getElementById("tableContainer");

export const createLogin = (elem) => {
    let data;
    let element = elem;
    let callback;
    return {
        setLabels: (labels) => { data = labels; },
        setCallback: (f) => { callback = f; },
        render: () => {
            element.innerHTML = data.map(([label, type]) => {
                return `<div>${label}</div><div><input id="${label}" class="input_css" type="${type}"></div>`;
            }).join('');
  
            element.innerHTML += `<button style="margin-right: 10px; margin-top: 10px;" class="btn btn-danger" id="chiudi_login">Chiudi</button>`;
            element.innerHTML += `<button style="margin-top: 10px;" class="btn btn-primary" id="invia_login">Accedi</button>`;
  
            document.getElementById("chiudi_login").onclick = () => {
                elem.style.display = "none";
                document.getElementById("overlay").style.display = "none";
            };
  
            document.getElementById("invia_login").onclick = () => {
                const username = document.getElementById("Username").value;
                const password = document.getElementById("Password").value;
                console.log(username)
                console.log(password)
  
                login_fetch(username, password)
                    .then((isValid) => {
                        if (isValid) {
                            elem.style.display = "none";
                            document.getElementById("bottoni").style.justifyContent = "start;";
                            document.getElementById("prenotazione").style.display = "block";
                            document.getElementById("login").style.display = "none";
                            document.getElementById("overlay").style.display = "none";
                            console.log("Accesso riuscito!");
                            alert("Benvenuto!");
  
                            data.forEach(([label]) => {
                                document.getElementById(label).value = "";
                            });
  
                        } else {
                            console.log("Accesso fallito. Credenziali errate.");
                            alert("Accesso negato. Controlla le credenziali.");
                            data.forEach(([label]) => {
                                document.getElementById(label).value = "";
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Errore durante il login:", error);
                        alert("Si è verificato un errore. Riprova più tardi.");
                    });
            };
        },
    };
  };

  export function createForm() {
    const formContainer = document.getElementById('form');
    const addButton = document.getElementById('prenotazione');

    addButton.onclick = () => {
        formContainer.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        formContainer.innerHTML = `
            <form id="addPrenotazione">
                <div class="mb-3">
                    <label for="date" class="form-label">Data</label>
                    <input type="date" id="date" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label for="hour" class="form-label">Ora</label>
                    <input type="number" id="hour" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label for="name" class="form-label">Nome</label>
                    <input type="text" id="name" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Tipologia</label>
                    <select id="type" class="form-control">
                        <option value="cardiology">Cardiologia</option>
                        <option value="psychology">Psicologia</option>
                        <option value="oncology">Oncologia</option>
                        <option value="orthopedics">Ortopedia</option>
                        <option value="neurology">Neurologia</option>
                    </select>
                </div>
                <button type="submit" id="button" class="btn btn-primary">Prenota</button>
                <button type="button" id="cancelAdd" class="btn btn-secondary" style="margin-left: 10px;">Annulla</button>
            </form>
        `;

        // Annulla
        document.getElementById('cancelAdd').onclick = () => {
            formContainer.innerHTML = '';
            formContainer.style.display = "none";
            document.getElementById("overlay").style.display = "none";
        };

        // Aggiungi prenotazione
        document.getElementById('addPrenotazione').onsubmit = (event) => {
            event.preventDefault(); // Previene il comportamento di default

            console.log("Form submitted, collecting data...");
            const date = document.getElementById('date').value;
            const hour = document.getElementById('hour').value;
            const name = document.getElementById('name').value;
            const type = document.getElementById('type').value;

            // Log per verificare che i dati siano corretti
            console.log("Date:", date);
            console.log("Hour:", hour);
            console.log("Name:", name);
            console.log("Type:", type);

            // Validazione dei dati
            if (!date || !hour || !name) {
                alert("Tutti i campi sono obbligatori.");
                return; // Interrompe il submit se i campi non sono validi
            }

            // Esegui la chiamata al server in modo asincrono
            fetch('/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    hour: hour,
                    name: name,
                    idType: getTypeId(type),
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response data:", data);

                if (data.result === "ok") {
                    alert("Prenotazione aggiunta con successo!");
                    TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana, tipologiaSelez }); // Carica le prenotazioni aggiornate
                    formContainer.innerHTML = ''; // Reset del form
                    formContainer.style.display = "none"; // Nascondi il form
                    document.getElementById("overlay").style.display = "none"; // Nascondi l'overlay
                } else {
                    alert("Errore durante l'inserimento della prenotazione.");
                }
            })
            .catch(error => {
                console.error("Errore nella richiesta:", error);
                alert("Errore durante la prenotazione.");
            });
        };
    };
};





export function selectTipologia(tipologiaId) {
    tipologiaSelez = tipologiaId;
    currentWeekOffset = 0;
    TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana, tipologiaSelez });
}


export function renderNavbarTipologie() {
    fetch('/tipologie')
        .then(response => response.json())
        .then(tipologie => {
            console.log("TipologieVisita:", tipologieVisita);
            if (Array.isArray(tipologie)) {
                const navbar = document.getElementById('navbarTipologie');
                if (!navbar) return;

                const tipologieVisita = {};
                tipologie.forEach(tipologia => {
                    tipologieVisita[tipologia.id] = tipologia.name;
                });

                let html = `
                    <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <div class="container-fluid">
                            <a class="navbar-brand" href="#">Tipologie</a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarNav">
                                <ul class="navbar-nav">
                `;

                tipologie.forEach(tipologia => {
                    html += `
                        <li class="nav-item">
                            <button class="btn btn-outline-primary" onclick="selectTipologia(${tipologia.id})">
                                ${tipologia.name}
                            </button>
                        </li>
                    `;
                });

                html += `
                                </ul>
                            </div>
                        </div>
                    </nav>
                `;

                navbar.innerHTML = html;
                if (tipologiaSelez !== 0) {
                        const selectedButton = document.getElementById(`tipologia-${tipologiaSelez}`);
                        if (selectedButton) {
                            selectedButton.classList.add('selected');
                        }
                }
            } else {
                console.error("I dati ricevuti non sono un array:", tipologie);
            }
        })
        .catch(error => {
            console.error("Errore nel caricamento delle tipologie:", error);
        });
}


export function TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana, tipologiaSelez }) {
    let currentWeekOffset = 0;

    const aggiornaTabella = () => {
        const tableContainer = document.getElementById("tableContainer");
        if (!tableContainer) return;

        let formattedDate = [];
        let dayCounter = 0;

        // Usa moment per partire dal primo giorno della settimana (lunedì)
        const startOfWeek = moment().startOf('week').add(currentWeekOffset, 'weeks');

        // Costruisce la lista delle date per i giorni lavorativi (lunedì-venerdì)
        for (let i = 0; dayCounter < 5; i++) {
            const futureDate = startOfWeek.clone().add(i, 'days');
            const dayIndex = futureDate.day();

            if (dayIndex !== 0 && dayIndex !== 6) { // Escludi domenica (0) e sabato (6)
                formattedDate.push({
                    date: futureDate.format('YYYY-MM-DD'),
                    day: giorniSettimana[dayIndex],
                });
                dayCounter++;
            }
        }

        // Fetch per ottenere le prenotazioni
        fetch('/prenotazioni')
            .then(response => response.json())
            .then(data => {
                
                console.log("Prenotazioni ricevute:", data);


                let html = '<div class="mb-2">';
                html += '<button id="precBtn" class="btn btn-outline-success">Settimana Precedente</button>';
                html += '<button id="succBtn" class="btn btn-outline-success">Settimana Successiva</button>';
                html += '</div>';
                html += '<table class="table table-bordered table-striped"><thead><tr><th>Ora</th>';

                formattedDate.forEach(({ day, date }) => {
                    html += `<th>${day} - ${date}</th>`;
                });
                html += '</tr></thead><tbody>';

                // Ora della prenotazione (es. 8, 9, 10, 11, 12)
                [8, 9, 10, 11, 12].forEach((ora) => {
                    html += `<tr><td>${ora}</td>`;
                    formattedDate.forEach(({ date }) => {
                        const key = `${tipologiaSelez}-${date}-${ora}`;
                        let disponibilita = diz[key] || 'Disponibile';
                        
                        const tipologiaVisitaStr = tipologieVisita[tipologiaSelez] || "";
                        console.log("Tipologia selezionata:", tipologiaVisitaStr);

                        const prenotazioni = data.filter(pr => pr.date === date && pr.hour === ora && pr.type === tipologiaVisitaStr);
                        if (prenotazioni.length > 0) {
                            disponibilita = prenotazioni.map(pr => pr.name).join(', ');
                        }

                        html += `<td class="${disponibilita !== "Disponibile" ? "table-info" : ""}">${disponibilita}</td>`;
                    });
                    html += '</tr>';
                });

                html += '</tbody></table>';
                tableContainer.innerHTML = html;

                // Event listener per i pulsanti
                document.getElementById('precBtn').onclick = () => { 
                    currentWeekOffset--; 
                    aggiornaTabella(); 
                };
                document.getElementById('succBtn').onclick = () => { 
                    currentWeekOffset++; 
                    aggiornaTabella(); 
                };
            })
            .catch(error => {
                console.error("Errore nel caricamento delle prenotazioni:", error);
            });
    };

    aggiornaTabella(); 
}





  
// Inizializza il form
createForm();

// Richiama la funzione per caricare la navbar
renderNavbarTipologie();

//loadBookings();


console.log("Dizionario delle prenotazioni:", diz);
TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana });
console.log("Tipologia selezionata:", tipologiaSelez);


