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

  export function login_fetch(username, password) {
    return new Promise((resolve, reject) => {
        fetch("./conf.json")
            .then(r => r.json())
            .then(confData => {
                if (!confData.token) {
                    console.error("Token non trovato in ./conf.json");
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
            <button type="button" id="button" class="btn btn-primary">Prenota</button>
        </form>
    `;
  
    // annulla
    document.getElementById('cancelAdd').onclick = () => {
        formContainer.innerHTML = '';
        formContainer.style.display = "none";
        document.getElementById("overlay").style.display = "none";
    };
  
    const date = document.getElementById('date').value;
    const hour = document.getElementById('hour').value;
    const name = document.getElementById('name').value;
    };
};
  
  // Inizializza il form
  createForm();
  
  