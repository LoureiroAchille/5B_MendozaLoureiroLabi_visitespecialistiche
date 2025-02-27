import {login_fetch,getTypeId,loadBookings} from "./function.js"

let currentWeekOffset = 0;
export let tipologiaSelez = 0;
let giorniSettimana = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
let tipologieVisita = {}; 
let diz = {}; 
window.selectTipologia = selectTipologia;

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

        //annula bottone
        document.getElementById('cancelAdd').onclick = () => {
            formContainer.innerHTML = '';
            formContainer.style.display = "none";
            document.getElementById("overlay").style.display = "none";
        };

        //prenotazione 
        document.getElementById('addPrenotazione').onsubmit = (event) => {
            event.preventDefault(); //cosi che non ricarichi la pagina

            console.log("Form submitted, collecting data...");
            const date = document.getElementById('date').value;
            const hour = document.getElementById('hour').value;
            const name = document.getElementById('name').value;
            const type = document.getElementById('type').value;

            //debug
            console.log("Date:", date);
            console.log("Hour:", hour);
            console.log("Name:", name);
            console.log("Type:", type);

            if (!date || !hour || !name) {
                alert("Tutti i campi sono obbligatori.");
                return;
            }
            //insert
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
                    TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana, tipologiaSelez }); // carica i dati sulla tabella
                    formContainer.innerHTML = '';
                    formContainer.style.display = "none"; 
                    document.getElementById("overlay").style.display = "none"; 
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
    let div = document.getElementById("gruppo bottoni");
    let elementi = div.querySelectorAll("*");
    elementi.forEach(el => {
        el.classList.replace("btn-primary", "btn-outline-primary");
    });
    tipologiaSelez = tipologiaId;
    currentWeekOffset = 0;
    document.getElementById(tipologiaId).classList.remove("btn-outline-primary");
    document.getElementById(tipologiaId).classList.add("btn-primary");
    TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana, tipologiaSelez });
}


export function renderNavbarTipologie() {
    fetch('/tipologie')
        .then(response => response.json())
        .then(tipologie => {
            if (Array.isArray(tipologie)) {
                const navbar = document.getElementById('navbarTipologie');
                if (!navbar) return;

                tipologieVisita = {};
                tipologie.forEach(tipologia => {
                    tipologieVisita[tipologia.id] = tipologia.name;
                });

                let html = `
                    <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <div class="container-fluid">
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <span style="margin-right: 20px;">Tipologie</span>
                            <div id="gruppo bottoni" class="btn-group" role="group" aria-label="Basic outlined example">
                `;

                tipologie.forEach(tipologia => {
                    html += `
                            <button id="${tipologia.id}" class="btn btn-outline-primary" onclick="selectTipologia(${tipologia.id})">
                                ${tipologia.name}
                            </button>
                    `;
                });

                html += ` 
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
    const aggiornaTabella = () => {
        fetchPrenotazioni((prenotazioni) => {
            const tableContainer = document.getElementById("tableContainer");
            if (!tableContainer) return;

            let formattedDate = [];
            let dayCounter = 0;

            const startOfWeek = moment().startOf('week').add(currentWeekOffset, 'weeks');

            for (let i = 0; dayCounter < 5; i++) {
                const futureDate = startOfWeek.clone().add(i, 'days');
                const dayIndex = futureDate.day();

                if (dayIndex !== 0 && dayIndex !== 6) { 
                    formattedDate.push({
                        date: futureDate.format('YYYY-MM-DD'),
                        day: giorniSettimana[dayIndex],
                    });
                    dayCounter++;
                }
            }

            let html = '<div class="mb-2">';
            html += '<button id="precBtn" class="btn btn-outline-success">Settimana Precedente</button>';
            html += '<button id="succBtn" class="btn btn-outline-success">Settimana Successiva</button>';
            html += '</div>';
            
            html += '<table class="table table-bordered table-striped"><thead><tr><th>Ora</th>';
            formattedDate.forEach(({ day, date }) => {
                html += `<th>${day} - ${date}</th>`;
            });
            html += '</tr></thead><tbody>';
            const ore = [8, 9, 10, 11, 12];
            ore.forEach((ora) => {
                html += `<tr><td>${ora}</td>`;
                formattedDate.forEach(({ date }) => {
                    const key = `${tipologiaSelez}-${date}-${ora}`;  //chiave per il diz
                    let disponibilita = diz[key] || 'Disponibile';
                    
                    const tipologiaVisitaStr = tipologieVisita[tipologiaSelez];
                    const prenotazioniFiltrate = prenotazioni.filter(pr => 
                        pr.date === date && 
                        pr.hour === ora && 
                        pr.type === tipologiaVisitaStr
                    );

                    if (prenotazioniFiltrate.length > 0) {
                        disponibilita = prenotazioniFiltrate.map(pr => pr.name).join(', ');
                    }

                    html += `<td class="${disponibilita !== "Disponibile" ? "table-info" : ""}">${disponibilita}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            
            tableContainer.innerHTML = html;

            document.getElementById('precBtn').onclick = () => { 
                currentWeekOffset--; 
                aggiornaTabella(); 
            };
            document.getElementById('succBtn').onclick = () => { 
                currentWeekOffset++; 
                aggiornaTabella(); 
            };
        });
    };

    aggiornaTabella();
}


function fetchPrenotazioni(callback) {
    fetch('/prenotazioni')
        .then(response => response.json())
        .then(data => {
            console.log("Prenotazioni ricevute:", data);
            callback(data);
        })
        .catch(error => {
            console.error("Errore nel caricamento delle prenotazioni:", error);
        });
}
fetchPrenotazioni((prenotazioni) => {
    TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana, tipologiaSelez });
});


createForm();

renderNavbarTipologie();


TabellaPrenotazioni({ tipologieVisita, diz, giorniSettimana });