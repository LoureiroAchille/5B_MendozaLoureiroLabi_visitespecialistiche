
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
export const loadBookings = () => {
    fetch('/prenotazioni')
        .then((response) => response.json())
        .then((bookings) => {
            const tableContainer = document.getElementById('booking-list');
            if (!tableContainer) return;

            let tableHTML = `<table class="table">
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Data</th>
                                        <th>Ora</th>
                                        <th>Nome</th>
                                    </tr>
                                </thead>
                                <tbody>`;
            bookings.forEach(booking => {
                tableHTML += `<tr>
                                <td>${booking.type}</td>
                                <td>${booking.date}</td>
                                <td>${booking.hour}</td>
                                <td>${booking.name}</td>
                            </tr>`;
            });
            tableHTML += `</tbody></table>`;
            tableContainer.innerHTML = tableHTML;
        });
};
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
export function selectTipologia(id) {
    // Esegui una logica in base all'id della tipologia selezionata
    console.log(`Tipologia selezionata: ${id}`);
    // Puoi aggiungere ulteriori azioni, ad esempio filtrare le prenotazioni o modificare la UI
    // Esempio: caricare le prenotazioni per quella tipologia
    loadBookings(id); // Questa funzione potrebbe essere modificata per supportare la tipologia selezionata
}
