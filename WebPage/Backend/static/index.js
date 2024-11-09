// Variables globales
let marcador;
let mapa;
let polyline;
let routeCoords = [];
let vehicle = {};
let plateSelect = document.getElementById('plate-select');
let selectedPlaca = 'all';
let defaultPlaca = null;
let vehiculos = {};

// Función para obtener las placas de vehículos desde el servidor y agregarlas al selector
async function fetchPlacas() {
    try {
        const response = await fetch('/placa');
        const placas = await response.json();

        placas.forEach(placa => {
            let optionExists = Array.from(plateSelect.options).some(option => option.value === placa);
            if (!optionExists) {
                let newOption = document.createElement('option');
                newOption.value = placa;
                newOption.text = placa;
                plateSelect.appendChild(newOption);
            }
        });

        if (!defaultPlaca && placas.length > 0) {
            defaultPlaca = placas[0];
            selectedPlaca = placas[0];
            actualizarDatosEnPantalla(placas[0]);
        }
    } catch (error) {
        console.error('Error al obtener las placas:', error);
    }
}

// Función para obtener los datos de un vehículo y actualizar su marcador y polilínea en el mapa
async function fetchData() {
    try {
        const placas = selectedPlaca === 'all' 
            ? Array.from(plateSelect.options).map(option => option.value).filter(v => v !== 'all') 
            : [selectedPlaca];

        for (const placa of placas) {
            const responses = await Promise.all([
                fetch(`/hour?placa=${placa}`),
                fetch(`/day?placa=${placa}`),
                fetch(`/latitude?placa=${placa}`),
                fetch(`/longitude?placa=${placa}`),
                fetch(`/RPM?placa=${placa}`),
                fetch(`/speed?placa=${placa}`)
            ]);

            const [data, data2, data3, data4, data5, data6] = await Promise.all(responses.map(res => res.json()));

            const nuevaPosicion = [data3.latitude, data4.longitude];

            if (!vehiculos[placa]) {
                // Crea una nueva entrada para el vehículo
                vehiculos[placa] = {
                    routeCoords: [],
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                    marker: L.marker(nuevaPosicion).addTo(mapa),
                    polyline: L.polyline([], { color: '#' + Math.floor(Math.random() * 16777215).toString(16) }).addTo(mapa),
                    data: {
                        latitude: data3.latitude,
                        longitude: data4.longitude,
                        day: data2.day,
                        hour: data.hour,
                        rpm: data5.RPM,
                        speed: data6.Speed
                    }
                };
            }

            const vehicle = vehiculos[placa];
            vehicle.routeCoords.push(nuevaPosicion);
            vehicle.data = {
                latitude: data3.latitude,
                longitude: data4.longitude,
                day: data2.day,
                hour: data.hour,
                rpm: data5.RPM,
                speed: data6.Speed
            };
            vehicle.marker.setLatLng(nuevaPosicion);
            vehicle.polyline.setLatLngs(vehicle.routeCoords);

            if (selectedPlaca === placa) {
                actualizarDatosEnPantalla(placa);
            }
        }

        actualizarPolilineas();
        document.getElementById('error').textContent = '';
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        document.getElementById('error').textContent = 'Error al obtener los datos.';
    }
}

// Función para actualizar las polilíneas en el mapa en función del vehículo seleccionado
function actualizarPolilineas() {
    Object.keys(vehiculos).forEach(placa => {
        const vehiculo = vehiculos[placa];
        if (selectedPlaca === 'all' || selectedPlaca === placa) {
            vehiculo.marker.addTo(mapa);
            vehiculo.polyline.addTo(mapa);
        } else {
            mapa.removeLayer(vehiculo.marker);
            mapa.removeLayer(vehiculo.polyline);
        }
    });
}

// Función para actualizar los datos del vehículo en pantalla
function actualizarDatosEnPantalla(placa) {
    const vehiculo = vehiculos[placa];
    document.getElementById('latitude').textContent = vehiculo.data.latitude || 'No disponible';
    document.getElementById('longitude').textContent = vehiculo.data.longitude || 'No disponible';
    document.getElementById('day').textContent = vehiculo.data.day || 'No disponible';
    document.getElementById('hour').textContent = vehiculo.data.hour || 'No disponible';
    document.getElementById('RPM').textContent = vehiculo.data.rpm || 'No disponible';
    document.getElementById('speed').textContent = vehiculo.data.speed || 'No disponible';
}

// Inicialización del mapa y eventos en la carga de la ventana
window.addEventListener('load', function () {
    mapa = L.map("contenedor-mapa").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa);

    let allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.text = 'Todas';
    plateSelect.appendChild(allOption);

    fetchPlacas(); // Cargar las placas desde el servidor
    fetchData();   // Cargar datos al inicio

    plateSelect.addEventListener('change', function () {
        selectedPlaca = plateSelect.value;
        if (selectedPlaca !== 'all') {
            actualizarDatosEnPantalla(selectedPlaca);
        }
        actualizarPolilineas();
    });

    setInterval(fetchData, 2000);
    const historicosBtn = document.getElementById("historicos-btn");
    
    historicosBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "historical");
        window.location.href = newURL;
    });
});
