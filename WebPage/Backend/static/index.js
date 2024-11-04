let marcador;  // Variable global para el marcador
let mapa;  // Variable global para el mapa
let polyline;  // Variable global para la polilínea
let routeCoords = [];  // Arreglo para almacenar las coordenadas de la ruta
let vehicle = {};
let plateSelect = document.getElementById('plate-select');
let selectedPlaca = 'all';
let defaultPlaca = null;
let vehiculos = {};


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
        //const response7 = await fetch('/placa');
        //const data7 = await response7.json();

        const placa = "DTZ890";
        const nuevaPosicion = [data3.latitude, data4.longitude];

        if (!vehiculos[placa]) {
            // Crea una nueva entrada para el vehículo
            vehiculos[placa] = {
                routeCoords: [], // Coordenadas de la ruta
                color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Color aleatorio
                marker: L.marker(nuevaPosicion).addTo(mapa), // Marcador del vehículo
                polyline: L.polyline([], { color: '#' + Math.floor(Math.random() * 16777215).toString(16) }).addTo(mapa), // Polilínea del vehículo
                data: { // Guardar datos del vehículo
                    latitude: data3.latitude,
                    longitude: data4.longitude,
                    day: data2.day,
                    hour: data.hour,
                    rpm: data5.rpm,
                    speed: data6.speed
                }
            };

            let optionExists = Array.from(plateSelect.options).some(option => option.value === placa);
            if (!optionExists) {
                let newOption = document.createElement('option');
                newOption.value = placa;
                newOption.text = placa;
                plateSelect.appendChild(newOption);
            }

            // Establecer la primera placa que llega como placa por defecto
            if (!defaultPlaca) {
                defaultPlaca = placa;
                selectedPlaca = placa;
                actualizarDatosEnPantalla(placa);
            }
        }

        const vehicle = vehiculos[placa];
        vehicle.routeCoords.push(nuevaPosicion);
        vehicle.data = { // Actualizar los datos
            latitude: data3.latitude,
            longitude: data4.longitude,
            day: data2.day,
            hour: data.hour,
            rpm: data5.rpm,
            speed: data6.speed
        };
        vehicle.marker.setLatLng(nuevaPosicion);
        vehicle.polyline.setLatLng(vehicle.routeCoords);
        
        
       // Filtrar y mostrar las polilíneas según la placa seleccionada
       actualizarPolilineas();

       // Actualizar datos en pantalla solo si el vehículo seleccionado es el que está actualizando
       if (selectedPlaca === placa) {
           actualizarDatosEnPantalla(placa);
       }

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

function actualizarDatosEnPantalla(placa) {
    const vehiculo = vehiculos[placa];
    document.getElementById('latitude').textContent = vehiculo.data.latitude || 'No disponible';
    document.getElementById('longitude').textContent = vehiculo.data.longitude || 'No disponible';
    document.getElementById('day').textContent = vehiculo.data.day || 'No disponible';
    document.getElementById('hour').textContent = vehiculo.data.hour || 'No disponible';
    document.getElementById('RPM').textContent = vehiculo.data.rpm || 'No disponible';
    document.getElementById('speed').textContent = vehiculo.data.speed || 'No disponible';
}

// Escuchar cambios en el dropdown
plateSelect.addEventListener('change', function() {
    selectedPlaca = plateSelect.value; // Actualizar la placa seleccionada
    if (selectedPlaca !== 'all') {
        actualizarDatosEnPantalla(selectedPlaca); // Actualizar los datos mostrados si se selecciona una placa específica
    }
    actualizarPolilineas(); // Actualizar el mapa con la nueva selección
});

// Actualización periódica de los datos
setInterval(fetchData, 2000);

// Ejecutar fetchData cuando la página se haya cargado completamente
window.addEventListener('load', function () {
    // Inicializar el mapa solo una vez que la página esté cargada
    mapa = L.map("contenedor-mapa").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa);

    let allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.text = 'Todas';   
    plateSelect.appendChild(allOption);

    fetchData(); // Ejecutar fetchData al cargar la página

    const historicosBtn = document.getElementById("historicos-btn");
    
    historicosBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "historical");
        window.location.href = newURL;
    });
});
