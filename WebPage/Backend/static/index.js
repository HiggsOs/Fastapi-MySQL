let marcador;  // Variable global para el marcador
let mapa;  // Variable global para el mapa
let polyline;  // Variable global para la polilínea
let routeCoords = [];  // Arreglo para almacenar las coordenadas de la ruta
let vehicle = {};
let plateSelect = document.getElementById('plate-select');
let selectedPlaca = 'all';

async function fetchData()  {
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
        const response5 = await fetch('/RPM');
        const data5 = await response5.json();
        const response6 = await fetch('/speed');
        const data6 = await response6.json();
        const response7 = await fetch('/placa');
        const data7 = await response7.json();

        const placa = data7.placa;
        const nuevaPosicion = [data3.latitude, data4.longitude];

        if (!vehiculos[placa]) {
            // Crea una nueva entrada para el vehículo
            vehiculos[placa] = {
                routeCoords: [], // Coordenadas de la ruta
                color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Color aleatorio
                marker: L.marker(nuevaPosicion).addTo(mapa), // Marcador del vehículo
                polyline: L.polyline([], { color: '#' + Math.floor(Math.random() * 16777215).toString(16) }).addTo(mapa) // Polilínea del vehículo
            };

            let optionExists = Array.from(plateSelect.options).some(option => option.value === placa);
            if (!optionExists) {
                let newOption = document.createElement('option');
                newOption.value = placa;
                newOption.text = placa;
                plateSelect.appendChild(newOption);
            }
        }

        const vehicle = vehicle[placa];
        vehicle.routeCoords.push(nuevaPosicion);
        vehicle.marker.setLatLng(nuevaPosicion);
        vehicle.polyline.setLatLng(vehicle.routeCoords);
        
        
        // Actualizar el contenido de la página con los datos obtenidos
        document.getElementById('latitude').textContent = data3.latitude || 'No disponible';
        document.getElementById('longitude').textContent = data4.longitude || 'No disponible';
        document.getElementById('day').textContent = data2.day || 'No disponible';
        document.getElementById('hour').textContent = data.hour || 'No disponible';
        document.getElementById('RPM').textContent = data5.hour || 'No disponible';
        document.getElementById('speed').textContent = data6.hour || 'No disponible';

        document.getElementById('error').textContent = ''; // Limpiar el mensaje de error si se actualizan correctamente los datos
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        document.getElementById('error').textContent = 'Error al obtener los datos.';
    }
}

function actualizarPolilineas() {
    Object.keys(vehiculos).forEach(placa => {
        const vehiculo = vehiculos[placa];
        if (selectedPlaca === 'all' || selectedPlaca === placa) {
            // Mostrar marcador y polilínea
            vehiculo.marker.addTo(mapa);
            vehiculo.polyline.addTo(mapa);
        } else {
            // Ocultar marcador y polilínea
            mapa.removeLayer(vehiculo.marker);
            mapa.removeLayer(vehiculo.polyline);
        }
    });
}

plateSelect.addEventListener('change', function() {
    selectedPlaca = plateSelect.value; // Actualizar la placa seleccionada
    actualizarPolilineas(); // Actualizar el mapa con la nueva selección
});

// Actualización periódica de los datos
setInterval(fetchData, 2000);

// Ejecutar fetchData cuando la página se haya cargado completamente
window.onload = function() {
    // Inicializar el mapa solo una vez
    mapa = L.map("contenedor-mapa").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa);

    let allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.text = 'Todas';
    plateSelect.appendChild(allOption);

    fetchData(); // Ejecutar fetchData al cargar la página

    const historicosBtn = document.getElementById("historicos-btn");
    
    // Agregar evento de clic
    historicosBtn.addEventListener("click", function() {
        // Obtener la URL actual
        const currentURL = window.location.href;
        
        // Crear la nueva URL reemplazando el complemento
        const newURL = currentURL.replace(/[^/]*$/, "historical");
        
        // Redirigir a la nueva URL
        window.location.href = newURL;
    });
};


