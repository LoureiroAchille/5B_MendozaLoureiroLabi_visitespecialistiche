import { createNavigator } from "./navigator.js";
fetch("/conf.json")
    .then((r) => r.json())
    .then((conf) => {
        const navigator = createNavigator(document.querySelector("#container"));
    });


const createMiddleware = () => {
    return {
        load: async () => {
            const response = await fetch("/booking");
            const json = await response.json();
            return json;
        },
        delete: async (id) => {
            const response = await fetch("/delete/" + id, {
                method: 'DELETE',
                });
            const json = await response.json();
            return json;
        },
        upload: async (inputFile) => {
            const response = await fetch("/insert", {
                method: 'POST',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    booking: booking
                })
            });
            const json = await response.json();
            return json;        
        }
    }
}

