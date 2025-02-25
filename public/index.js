
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

const render = (bookings) => {
    const container = document.querySelector("#booking-list");
    container.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <span>${booking.date} - ${booking.hour}:00 - ${booking.name} (${booking.type})</span>
            <button onclick="handleDelete(${booking.id})">Elimina</button>
        </div>
    `).join("");
};

const controller = async (middleware) => {
    const button = document.querySelector("#button");
    button.onclick = async () => {
        const idType = document.querySelector("#idType").value;
        const date = document.querySelector("#date").value;
        const hour = document.querySelector("#hour").value;
        const name = document.querySelector("#name").value;

        await middleware.upload({ idType, date, hour, name });
        const bookings = await middleware.load();
        render(bookings);
    };

    window.handleDelete = async (id) => {
        await middleware.delete(id);
        const bookings = await middleware.load();
        render(bookings);
    };

    const bookings = await middleware.load();
    render(bookings);
};

controller(createMiddleware());
