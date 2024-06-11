// Cargar el contenido del archivo navbar.html y agregarlo al div con id navbarContainer
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbarContainer').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el navbar:', error));

const rankingForm = document.querySelector("#rankingForm");
const selectCountry = document.getElementById('selectCountry');

rankingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(rankingForm);
    const entries = formData.entries();
    let dataArray = [];
    let currentItem = {};
    let rankingDate = '';

    for (let entry of entries) {
        if (entry[0] === 'countryId') {
            if (Object.keys(currentItem).length > 0) {
                dataArray.push(currentItem);
                currentItem = {};
            }
            currentItem.countryId = entry[1];
        } else if (entry[0] === 'new_totalPoints') {
            currentItem.new_totalPoints = entry[1];
        } else if (entry[0] === 'fechaRanking') {
            rankingDate = entry[1];
        }
    }

    if (Object.keys(currentItem).length > 0) {
        dataArray.push(currentItem);
    }

    console.log(dataArray);
    console.log(rankingDate);
    dataArray.push({ fechaRanking: rankingDate })
    console.log(dataArray);
    // Aquí puedes realizar acciones adicionales con los datos, como enviarlos a un servidor o procesarlos en el cliente.

    try{
        const response = await fetch("/api/ranking/update", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataArray),
        });
        if(response.ok){
            console.log("Se ha actualizado el ranking exitosamente");
            window.location.href = '/';
        } else {
            console.log("Ha ocurrido un error al actualizar el ranking");
        }
    } catch (error){
        console.error('Error al actualizar el ranking:', error);
    }
});


window.addEventListener("DOMContentLoaded", async (e) => {
    // Cargar la lista de países desde la API
    const response = await fetch("/api/ranking/countries");
    const data = await response.json();
    console.log(data);
    renderCountry(data);
});

const renderCountry = (countries) => {
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country[0];
        option.textContent = country[1];
        selectCountry.appendChild(option);
    });
}

document.getElementById('addCountryButton').addEventListener('click', function () {
    const container = document.getElementById('countryPointsContainer');
    const newCountryRow = document.createElement('div');
    newCountryRow.classList.add('row');

    const newCountryLabel = document.createElement('label');
    newCountryLabel.innerText = 'Selecciona el país:';
    newCountryRow.appendChild(newCountryLabel);

    const newCountrySelectDiv = document.createElement('div');
    newCountrySelectDiv.classList.add('col-sm-10');
    const newCountrySelect = document.createElement('select');
    newCountrySelect.name = 'countryId';
    newCountrySelect.classList.add('selectCountry');
    // Clonar las opciones del select existente
    const options = selectCountry.cloneNode(true).childNodes;
    options.forEach(option => {
        newCountrySelect.appendChild(option.cloneNode(true));
    });
    newCountrySelectDiv.appendChild(newCountrySelect);
    newCountryRow.appendChild(newCountrySelectDiv);
    container.appendChild(newCountryRow);
    container.appendChild(document.createElement('br'));

    const newPointsRow = document.createElement('div');
    newPointsRow.classList.add('row');

    const newPointsLabel = document.createElement('label');
    newPointsLabel.innerText = 'Ingresa el nuevo valor de puntos totales para el país seleccionado:';
    newPointsRow.appendChild(newPointsLabel);

    const newPointsInputDiv = document.createElement('div');
    newPointsInputDiv.classList.add('col-sm-10');
    const newPointsInput = document.createElement('input');
    newPointsInput.type = 'number';
    newPointsInput.name = 'new_totalPoints';
    newPointsInput.required = true;
    newPointsInputDiv.appendChild(newPointsInput);
    newPointsRow.appendChild(newPointsInputDiv);
    container.appendChild(newPointsRow);
    container.appendChild(document.createElement('br'));
});