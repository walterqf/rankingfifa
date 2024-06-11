const selectDate = document.getElementById('selectDate');
window.addEventListener("DOMContentLoaded", async (e) => {
    //console.log("loaded");
    const responseD = await fetch("/api/ranking/rank_date");
    const dataD = await responseD.json();

    dataD.forEach((fecha) => {
        console.log("Valor de fecha", fecha);
        const fechaFormateada = formattedDate(fecha);
        console.log("fecha formateada", fechaFormateada);


        const option = document.createElement('option');
        option.value = fechaFormateada;
        option.textContent = fechaFormateada;
        selectDate.appendChild(option);
    });
});

const searchData = () => {
    // Obtener el valor de la fecha seleccionada
    let selectedDate = formatDate(selectDate.value);


    fetch(`/api/ranking/${selectedDate}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            ranking = data;
            renderRanking(ranking);
        })
        .catch(error => console.error('Error fetching players:', error));
}

const renderRanking = (rankings) => {
    const tableBody = document.getElementById('rankingTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    let valueAnterior = 0;
    let extNumber = 0;
    let jugadoresNac = 0;


    rankings.forEach(ranking => {
        const row = document.createElement('tr');

        ranking.forEach((data, index) => {
            const cell = document.createElement('td');

            if (index === 8) {
                cell.textContent = formattedDate(data);
                row.appendChild(cell);
            } else if (index === 10) {
                // Hacer editable la celda de jugadores extranjeros
                const input = document.createElement('input');
                input.type = 'text';
                input.value = data;
                input.style.border = 'none';
                input.style.width = '100%';
                input.style.boxSizing = 'border-box';
                input.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        console.log('Cambio en el valor de jugadores extranjeros:', e.target.value);
                        valueAnterior = ranking[9];
                        extNumber = input.value;
                        console.log('Valor anterior:', valueAnterior, 'Nuevo valor:', extNumber);
                        if (extNumber > valueAnterior) {

                            alert("El número de jugadores extranjeros no puede ser mayor al valor anterior");
                        } else {
                            jugadoresNac = valueAnterior - extNumber;
                            try {
                                const response = await fetch(`/api/ranking/update/${ranking[1]}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({extNumber, jugadoresNac}),
                                });
                                const data = await response.json();
                                console.log(data);
                                searchData();
                            } catch (error) {
                                console.error('Error:', error);
                            }
                        }
                        // Aquí puedes añadir la lógica para guardar el valor actualizado en tu backend
                    }
                });
                cell.appendChild(input);
                row.appendChild(cell);
            } else {
                cell.textContent = data;
                row.appendChild(cell);

                if (index === 1) {
                    // Ocultar la columna de ID de país
                    cell.style.display = 'none';
                }

                if (index === ranking.length - 1) {
                    const additionalCell = document.createElement('td');
                    const link = document.createElement('a');
                    link.href = `jugadores.html?countryId=${ranking[1]}`; // Redirigir usando el ID del país
                    link.textContent = "Plantilla"; // Texto del enlace
                    additionalCell.appendChild(link);
                    row.appendChild(additionalCell);
                }
            }
        });

        tableBody.appendChild(row);
    });
};

// Cargar el contenido del archivo navbar.html y agregarlo al div con id navbarContainer
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbarContainer').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el navbar:', error))

function goBack() {
    window.history.back();
}

const formatDate = (dateString) => {
    // Fecha en formato "dd/mm/yyyy"
    let dateStr = dateString;

// Dividir la cadena en partes (día, mes y año)
    let parts = dateStr.split('/');

// Extraer las partes de la fecha
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

// Formatear la fecha como "yyyy-mm-dd"
    let formattedDate = `${year}-${month}-${day}`;

    console.log(formattedDate); // Salida: "2024-04-04"
    return formattedDate;
};


function formattedDate(dateString) {
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