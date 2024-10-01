window.onload = function () {
    const historicosBtn = document.getElementById("historicos-btn");
    const indexBtn = document.getElementById("index-btn");
    let lastMarker = null; // Variable para almacenar el último marcador
    let lastCircle = null; // Variable para almacenar el último círculo
    const radius = 1000; // Radio en metros

    historicosBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "historical.html");
        window.location.href = newURL;
    });

    indexBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "index.html");
        window.location.href = newURL;
    });

    // Inicializar el mapa
    mapa_3 = L.map("contenedor-mapa-3").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_3);

    // Agregar evento de clic para obtener coordenadas, crear un marcador y un círculo
    mapa_3.on('click', function(e) {
        const { lat, lng } = e.latlng;

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
        
        // Opción de mostrar un mensaje en el marcador con las coordenadas
        lastMarker.bindPopup(`Coordenadas: Latitud = ${lat}, Longitud = ${lng}, Radio = ${radius} metros`).openPopup();

        // Mostrar coordenadas y rango en la consola
        console.log(`Latitud: ${lat}, Longitud: ${lng}, Radio: ${radius} metros`);
    });
};





