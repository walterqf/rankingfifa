 // Cargar el contenido del archivo navbar.html y agregarlo al div con id navbarContainer
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbarContainer').innerHTML = data;
        })
        .catch(error => console.error('Error al cargar el navbar:', error));