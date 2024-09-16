let marcador;  // Variable global para el marcador
let mapa;  // Variable global para el mapa

async function fetchData() {
    try {
        // Hacer las solicitudes a los endpoints
        const response = await fetch('/hour');
        const data = await response.json();
        const response2 = await fetch('/day');
        const data2 = await response2.json();
        const response3 = await fetch('/latitude');
        const data3 = await response3.json();
        const response4 = await fetch('/longitude');
        const data4 = await response4.json();
        
        // Actualizar el contenido de la página con los datos obtenidos
        document.getElementById('latitude').textContent = data3.latitude || 'No disponible';
        document.getElementById('longitude').textContent = data4.longitude || 'No disponible';
        document.getElementById('day').textContent = data2.day || 'No disponible';
        document.getElementById('hour').textContent = data.hour || 'No disponible';

        // Limpiar el mensaje de error si se actualizan correctamente los datos
        document.getElementById('error').textContent = '';

        const nuevaPosicion = [data3.latitude, data4.longitude];

        // Actualizar la posición del marcador en el mapa
        if (marcador) {
            marcador.setLatLng([data3.latitude, data4.longitude]);
        } else {
            marcador = L.marker([data3.latitude, data4.longitude]).addTo(mapa);
            mapa.setView(nuevaPosicion, 100);
        }

        // Actualizar el popup del marcador con la nueva hora y fecha
        marcador.bindPopup("Fecha y hora: " + data2.day + " " + data.hour).openPopup();

        mapa.setView(nuevaPosicion);

    } catch (error) {
        console.error('Error al obtener los datos:', error);
        document.getElementById('error').textContent = 'Error al obtener los datos.';
    }
}

// Actualización periódica de los datos
setInterval(fetchData, 10000);

// Ejecutar fetchData cuando la página se haya cargado completamente
window.onload = function() {
    // Inicializar el mapa solo una vez
    mapa = L.map("contenedor-mapa").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa);

    // Ejecutar fetchData al cargar la página
    fetchData();
};

