
const createMiddleware = () => {
    return {
        load: async () => {
            const response = await fetch("/prenotazioni");
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch("/delete/" + id, {
                method: 'DELETE'
            });
            return response.json();
        },
        upload: async (booking) => {
            const response = await fetch("/insert", {
                method: 'POST',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ booking })
            });
            return response.json();        
        }
    };
};


const controller = async (middleware) => {
    const button = document.querySelector("#button");
    if (button) {
        button.onclick = async () => {
            const idType = document.querySelector("#navbarTipologie .active")?.dataset.id; // Prende la tipologia selezionata
            const date = document.querySelector("#date").value;
            const hour = document.querySelector("#hour").value;
            const name = document.querySelector("#name").value;

            if (!idType) {
                alert("Seleziona una tipologia prima di prenotare.");
                return;
            }

            await middleware.upload({ idType, date, hour, name });
        };
    }
};

const middleware = createMiddleware();
controller(middleware);