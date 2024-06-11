// Cargar el contenido del archivo navbar.html y agregarlo al div con id navbarContainer
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbarContainer').innerHTML = data;
    })
    .catch(error => console.error('Error al cargar el navbar:', error))
const rankingForm = document.querySelector("#rankingForm");
const selectCountry = document.getElementById('selectCountry1');
const selectCountry2 = document.getElementById('selectCountry2');
window.addEventListener("DOMContentLoaded", async (e) => {
    // Cargar la lista de países desde la API
    const response = await fetch("/api/ranking/countries");
    const data = await response.json();
    console.log(data);
    renderCountry(data);
    // Obtener la fecha actual
    const today = new Date();

    // Formatear la fecha como YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const dd = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // Establecer el valor del campo de entrada como la fecha actual
    document.getElementById('date').value = formattedDate;
});

const renderCountry = (countries) => {
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country[0];
        option.textContent = country[1];
        selectCountry.appendChild(option);
        selectCountry2.appendChild(option.cloneNode(true));
    });
}

rankingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let result = "";
    let countryId1 = selectCountry.value;
    let countryId2 = selectCountry2.value;
    let extraPoints1 = document.getElementById('extra1').value;
    let extraPoints2 = document.getElementById('extra2').value;
    let newValor = 0;
    let newValor2 = 0;
    let countries = [countryId1, countryId2];
    let date = document.getElementById('date').value;
    let countriesValues =[];
    console.log("Formulario enviado", countryId1, countryId2, date);
    for (const country of countries) {
        try {
            const response = await fetch(`/api/rankings/total_points/${country}`);
            const data = await response.json();
            console.log(data);
            countriesValues.push(data);
        } catch (error) {
            console.error("Error:", error);
        }
    }
    newValor = parseInt(countriesValues[0]) + parseInt(extraPoints1);
    newValor2 = parseInt(countriesValues[1]) + parseInt(extraPoints2);

    if(newValor > newValor2){
        result = `El país ganador es: ${selectCountry.options[selectCountry.selectedIndex].text}`;
    }else{
        result = `El país ganador es: ${selectCountry2.options[selectCountry2.selectedIndex].text}`;

    }
    Swal.fire({
        title: `${result}`,
        showClass: {
            popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
        },
        hideClass: {
            popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
        }
    });
});