const getCountryIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('countryId');
};

const renderPlayers = (players) => {
    const tableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar el contenido actual del tbody
    players.forEach((player, rowIndex) => {
        const row = document.createElement('tr');

        Object.keys(player).forEach((key, colIndex) => {
            const cell = document.createElement('td');
            if (colIndex === 4 || colIndex === 11) {
                cell.style.display = 'none';
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

const countryId = getCountryIdFromUrl();
if (countryId) {
    fetch(`/api/rankingsab/${countryId}`)
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