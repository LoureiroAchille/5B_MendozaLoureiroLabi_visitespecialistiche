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