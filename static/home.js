const selectDate = document.getElementById('selectDate');
window.addEventListener("DOMContentLoaded", async (e) => {
    //console.log("loaded");
    try {
        const response = await fetch("/api/ranking");
        const data = await response.json();
        console.log(data);
        renderRanking(data);
    } catch (error) {
        console.error("Error:", error);
    }
});


const renderRanking = (rankings) => {
    const tableBody = document.getElementById('rankingTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    rankings.forEach(ranking => {
        const row = document.createElement('tr');

        ranking.forEach((data, index) => {
            const cell = document.createElement('td');
            cell.textContent = data;

            row.appendChild(cell);
            if (index === 1) {
                //Ocultar la columna de ID de país
                cell.style.display = 'none';
            }
            if (index === 8) {
                cell.textContent = formattedDate(data);
                row.appendChild(cell);
            } else if (index === ranking.length - 1) {
                const additionalCell = document.createElement('td');
                const link = document.createElement('a');
                link.href = `players.html?countryId=${ranking[1]}`; // Redirigir usando el ID del país
                link.textContent = "Plantilla"; // Texto del enlace
                additionalCell.appendChild(link);
                row.appendChild(additionalCell);
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