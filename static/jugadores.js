window.addEventListener("DOMContentLoaded", async (e) => {
    initialText.innerHTML ="";
    try {
        const response = await fetch(`/api/ranking/countries/${countryId}`);
        countryName = await response.json();
    }
    catch (error) {
        console.error('Error fetching country:', error);
    }

    initialText.innerHTML = "<h2 class='text-center'>Plantilla de jugadores actual de " + countryName + "</h2>";
});
const getCountryIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('countryId');
    return { id };
};
const params = getCountryIdFromUrl();
const countryId = params.id;
let countryName = "";
let playersUpdate = [];
const initialText = document.getElementById('initialText');
const renderPlayers = (players) => {
    const tableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar el contenido actual del tbody
    players.forEach((player, rowIndex) => {
        const row = document.createElement('tr');

        Object.keys(player).forEach((key, colIndex) => {
            const cell = document.createElement('td');
            if (colIndex === 4 || colIndex === 11) {
                cell.style.display = 'none';
            }
            if (colIndex === 10 || colIndex === 5) { // Solo hacer editable la columna 2 (índice 1)
                // Crear un campo de entrada para que la celda sea editable
                const input = document.createElement('input');
                input.type = 'text';
                input.value = player[key];
                input.style.border = 'none';
                input.style.width = '100%';
                input.style.boxSizing = 'border-box';

                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault(); // Prevenir la acción por defecto de la tecla Enter
                        input.blur(); // Opcional: Remover el foco del campo de entrada, simulando un "submit"
                    }
                });

                // Hacer el campo de entrada editable al hacer clic en la celda
                input.addEventListener('change', (event) => {
                    event.preventDefault();
                    player[key] = event.target.value;
                    console.log(`Player ${rowIndex + 1} updated:`, player); // Aquí podrías hacer una llamada a tu base de datos para actualizarla

                    const newAltura = player[5];
                    const newValorMercado = player[10];
                    const playerId = player[11];

                    // Buscar si ya existe una entrada para la fila actual en playersUpdate
                    const existingPlayerIndex = playersUpdate.findIndex(p => p.playerId === playerId);

                    const updatePlayer = {
                        playerId: playerId,
                        newAltura: newAltura,
                        newValorMercado: newValorMercado
                    };

                    if (existingPlayerIndex !== -1) {
                        // Si ya existe, actualiza la entrada
                        playersUpdate[existingPlayerIndex] = updatePlayer;
                    } else {
                        // Si no existe, agrega una nueva entrada
                        playersUpdate.push(updatePlayer);
                    }

                    console.log(`Updated players array:`, playersUpdate);
                });

                cell.appendChild(input);
            } else {
                // No editable, solo texto
                if (colIndex === 2 || colIndex === 9) {
                    console.log(player[key]);
                    cell.textContent = formatDate(player[key]);
                } else {
                    cell.textContent = player[key];
                }
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
};


if (countryId) {
    fetch(`/api/ranking/${countryId}`)
        .then(response => response.json())
        .then(data => renderPlayers(data))
        .catch(error => console.error('Error fetching players:', error));
} else {
    console.error('No countryId found in URL');
}

// Cargar el contenido del archivo navbar.html y agregarlo al div con id navbarContainer
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbarContainer').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el navbar:', error));

function goBack() {
    window.history.back();
}

const playersForm = document.querySelector("#playersForm");

playersForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(playersForm);
    const entries = formData.entries();
    console.log("Formulario enviado", countryId);
    console.log("Valor de updatePlayer: ", playersUpdate);
    try {
        const response = await fetch(`/api/ranking/countries/${countryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(playersUpdate),
        });
        const data = await response.json();
        console.log(data);
        // // Redirigir a la página de ranking
        window.location.href = "/generar_ranking.html";
    } catch (error) {
        console.error("Error:", error);
    }

});

function formatDate(dateString) {
    let date = new Date(dateString);

// Extraer el día, el mes y el año
    let day = date.getUTCDate();
    let month = date.getUTCMonth() + 1; // Los meses son indexados desde 0
    let year = date.getUTCFullYear();

// Asegurar que el día y el mes tengan dos dígitos
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

// Formatear la fecha como "dd/mm/yyyy"
    let formattedDate = day + '/' + month + '/' + year;
    return formattedDate;
}