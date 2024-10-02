window.onload = function () {
    const historicosBtn = document.getElementById("historicos-btn");
    const indexBtn = document.getElementById("index-btn");
    const radioInput = document.getElementById("radio"); // Obtener el input range
    const extractCoordsBtn = document.getElementById("extract-coords-btn");
    let lastMarker = null; // Variable para almacenar el último marcador
    let lastCircle = null; // Variable para almacenar el último círculo
    const value = document.querySelector("#value");
    const input = document.querySelector("#radio");

    historicosBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "historical");
        window.location.href = newURL;
    });

    indexBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "");
        window.location.href = newURL;
    });

    // Inicializar el mapa
    mapa_3 = L.map("contenedor-mapa-3").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_3);

    // Agregar evento de clic para obtener coordenadas, crear un marcador y un círculo
    mapa_3.on('click', function(e) {
        const { lat, lng } = e.latlng;
        const radius = parseInt(radioInput.value); // Obtener el valor del radio actual

        // Eliminar el último marcador y círculo si existen
        if (lastMarker) {
            mapa_3.removeLayer(lastMarker);
        }
        if (lastCircle) {
            mapa_3.removeLayer(lastCircle);
        }

        // Crear un nuevo marcador en las coordenadas
        lastMarker = L.marker([lat, lng]).addTo(mapa_3);
        
        // Crear un círculo con el radio especificado alrededor del marcador
        lastCircle = L.circle([lat, lng], { radius }).addTo(mapa_3);
        
        // Opción de mostrar un mensaje en el marcador con las coordenadas y el radio actual
        lastMarker.bindPopup(`Coordenadas: Latitud = ${lat}, Longitud = ${lng}`).openPopup();

        // Mostrar coordenadas y rango en la consola
        console.log(`Latitud: ${lat}, Longitud: ${lng}, Radio: ${radius} metros`);
    });
    
    // Escuchar cambios en el input range para actualizar el radio en tiempo real
    radioInput.addEventListener("input", function() {
        if (lastCircle) {
            const radius = parseInt(radioInput.value);
            lastCircle.setRadius(radius); // Actualizar el radio del círculo si ya está en el mapa
            console.log(`Radio actualizado a: ${radius} metros`);
        }
    });

    value.textContent = radioInput.value;
    radio.addEventListener("input", (event) => {
        value.textContent = event.target.value;
    });

    extractCoordsBtn.addEventListener("click", function() {
        if (lastCircle) {
            const bounds = lastCircle.getBounds(); // Obtener los límites del círculo
            const latMin = bounds.getSouth(); // Latitud mínima
            const latMax = bounds.getNorth(); // Latitud máxima
            const lngMin = bounds.getWest();  // Longitud mínima
            const lngMax = bounds.getEast();  // Longitud máxima

            // Mostrar los valores en la consola
            console.log(`Latitud mínima: ${latMin}, Latitud máxima: ${latMax}`);
            console.log(`Longitud mínima: ${lngMin}, Longitud máxima: ${lngMax}`);

            // Construir la URL de la query GET
            const url = `/api/position?lat_min=${latMin}&lat_max=${latMax}&long_min=${lngMin}&long_max=${lngMax}`;
            console.log(`URL generada: ${url}`);

            // Hacer la petición GET usando fetch
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error en la solicitud: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Procesar los datos recibidos
                    console.log("Datos recibidos:", data);
                })
                .catch(error => {
                    console.error("Error al realizar la solicitud:", error);
                });
        } else {
            console.log("No se ha creado un círculo aún.");
        }
    });
};