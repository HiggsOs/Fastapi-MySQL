document.addEventListener("DOMContentLoaded", function() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const submitButton = document.getElementById("enviar");
    let mapa_2;
    let lastRoute = null; // Variable para almacenar la última polilínea
    const indexBtn = document.getElementById("index-btn");
    const contenedor_info = document.querySelector('.contenedor-info')
    const contenedor_btn = document.querySelector('.contenedor-btn')
    const filtro_posicion= document.getElementById("position-switch")
    const radioInput = document.getElementById("radio"); // Obtener el input range
    const extractCoordsBtn = document.getElementById("extract-coords-btn");
    let lastMarker = null; // Variable para almacenar el último marcador
    let lastCircle = null; // Variable para almacenar el último círculo
    const value = document.querySelector("#value");
    const polylines = []; // Almacenar polilíneas en el mapa
    const selectPolyline = document.getElementById('polyline-select'); // Usar el selector ya existente
    let plateSelect = document.getElementById('plate-select');
    let vehiclePlates = [];


    // Agregar evento de clic
    indexBtn.addEventListener("click", function() {
        // Obtener la URL actual
        const currentURL = window.location.href;

        // Crear la nueva URL reemplazando el complemento
        const newURL = currentURL.replace(/[^/]*$/, "");

        // Redirigir a la nueva URL
        window.location.href = newURL;
    });

    async function fetchPlacas() {
        try {
            const response = await fetch('/placa');
            const placas = await response.json();
            console.log(placas);
            // Llenar el dropdown con las placas
            placas.forEach(placa => {
                let optionExists = Array.from(plateSelect.options).some(option => option.value === placa);
                if (!optionExists) {
                    let newOption = document.createElement('option');
                    newOption.value = placa;
                    newOption.text = placa;
                    plateSelect.appendChild(newOption);
                }
            });
            vehiclePlates = placas;
            console.log(vehiclePlates);

        } catch (error) {
            console.error('Error al obtener las placas:', error);
        }
    }

    // Función que se ejecuta cuando cambia la fecha de inicio
    startDateInput.addEventListener("change", function () {
        endDateInput.min = startDateInput.value;
    });

    // Función que se ejecuta cuando cambia la fecha de final
    endDateInput.addEventListener("change", function () {
        startDateInput.max = endDateInput.value
    });
    
    //Funcion para activar el filtro de posición
    filtro_posicion.addEventListener("change", (event) => {
        if (event.target.checked){
            contenedor_info.classList.add('activo')
            contenedor_btn.classList.add('activo')
        } else {
            contenedor_info.classList.remove('activo')
            contenedor_btn.classList.remove('activo')
        }        
    });
    
    // Función para validar al enviar
    submitButton.addEventListener("click", function (event) {
        if (endDateInput.value < startDateInput.value) {
            event.preventDefault();
            alert("La fecha final no puede ser anterior a la fecha de inicio.");
            return;
        }
    
        const startDateTime = startDateInput.value;
        const endDateTime = endDateInput.value;
        //split de los datos
        const startDate = startDateTime.split("T")[0];
        const startTime = startDateTime.split("T")[1];
        const endDate = endDateTime.split("T")[0].replace("%3A", ":");
        const endTime = endDateTime.split("T")[1].replace("%3A", ":");

        // Usar URLSearchParams para construir la cadena de consulta
        const params = new URLSearchParams({
            start_day: startDate,
            end_day: endDate,
            start_hour: startTime,
            end_hour: endTime
        });
    
        const urlString = `days-hours/?${decodeURIComponent(params.toString())}`;
        console.log(urlString);
        // Array para almacenar las rutas de todos los vehículos
        let allRoutes = [];
    
        // Función para hacer la petición para cada placa y graficar sus rutas
        async function fetchAndDrawRoutes(vehiclePlates) {
            try {
                if (!Array.isArray(vehiclePlates)) {
                    throw new Error('El argumento vehiclePlates no es un array');
                }
                // Para cada placa, hacer una petición y dibujar su ruta
                for (const plate of vehiclePlates) {
                    console.log(`Procesando la placa: ${plate}`);
                    const response = await fetch(urlString + `&placa=${plate}`);
                    console.log(urlString + `&placa=${plate}`);
        
                    if (response.status === 404) {
                        console.log("No se encontraron datos para la placa:", plate);
                        alert(`No se encontraron datos para la placa ${plate}.`);
                        continue;
                    }
        
                    if (!response.ok) {
                        throw new Error(`Error en la solicitud: ${response.status}`);
                    }
        
                    const data = await response.json();
                    const resultados = data.resultados;
        
                    // Almacenar los resultados de la placa
                    allRoutes.push({ plate, results: resultados });
        
                    // Llamar a la función para dibujar la ruta de este vehículo
                    drawRouteOnMap(resultados, plate);
                }
        
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        }
    
        // Función para dibujar la ruta en el mapa
        function drawRouteOnMap(resultados, plate) {
            // Eliminar polilíneas y flechas anteriores si existen
            if (lastRoute) {
                mapa_2.removeLayer(lastRoute);
            }
            arrows.forEach(arrow => {
                mapa_2.removeLayer(arrow);
            });
            arrows = []; // Reiniciar las flechas
    
            const coordinates = resultados.map(result => [
                parseFloat(result.Latitude.trim()), 
                parseFloat(result.Longitude.trim())
            ]);
    
            // Asignar un color diferente a cada placa (puedes usar un arreglo de colores)
            const color = getVehicleColor(plate);
    
            // Dibujar la nueva polilínea con un color distinto para cada vehículo
            lastRoute = L.polyline(coordinates, { color: color }).addTo(mapa_2);
            mapa_2.fitBounds(lastRoute.getBounds());
        }
    
        // Función para obtener un color para cada placa
        function getVehicleColor(plate) {
            // Puedes mejorar esto para asignar colores aleatorios o usar un esquema
            const colors = ['blue', 'green', 'red', 'purple', 'orange'];
            const index = vehiclePlates.indexOf(plate);
            return colors[index % colors.length];
        }
    
        // Llamar a la función para hacer las peticiones
        fetchAndDrawRoutes(vehiclePlates);
    
        // Función para filtrar por placa seleccionada
        const vehicleSelect = document.getElementById('vehicle-select');
        vehicleSelect.addEventListener('change', function () {
            const selectedPlate = vehicleSelect.value;
    
            if (selectedPlate) {
                // Filtrar las rutas de los vehículos y solo mostrar la seleccionada
                const filteredRoute = allRoutes.find(route => route.plate === selectedPlate);
                if (filteredRoute) {
                    drawRouteOnMap(filteredRoute.results, selectedPlate);
                }
            } else {
                // Si no hay placa seleccionada, mostrar todas las rutas
                allRoutes.forEach(route => {
                    drawRouteOnMap(route.results, route.plate);
                });
            }
        });
    });
    

    function convertirAHorasMinutos(hora) {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos; // Convertir a minutos totales
    }
    

    window.onload = function() {
        mapa_2 = L.map("contenedor-mapa-2").setView([10.96854, -74.78132], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_2);

        let allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.text = 'Todas';
        plateSelect.appendChild(allOption);
        fetchPlacas();

        filtro_posicion.addEventListener("change", (event) => {
            if (event.target.checked){
                contenedor_info.classList.add('activo')
                contenedor_btn.classList.add('activo')

                if (lastRoute) {
                    mapa_2.removeLayer(lastRoute);
                }

                mapa_2.on('click', function(e) {
                    const { lat, lng } = e.latlng;
                    const radius = parseInt(radioInput.value); // Obtener el valor del radio actual
            
                    // Eliminar el último marcador y círculo si existen
                    if (lastMarker) {
                        mapa_2.removeLayer(lastMarker);
                    }
                    if (lastCircle) {
                        mapa_2.removeLayer(lastCircle);
                    }
            
                    // Crear un nuevo marcador en las coordenadas
                    lastMarker = L.marker([lat, lng]).addTo(mapa_2);
                    
                    // Crear un círculo con el radio especificado alrededor del marcador
                    lastCircle = L.circle([lat, lng], { radius }).addTo(mapa_2);
                    
                    // Opción de mostrar un mensaje en el marcador con las coordenadas y el radio actual
                    //lastMarker.bindPopup(`Coordenadas: Latitud = ${lat}, Longitud = ${lng}`).openPopup();
            
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
                radioInput.addEventListener("input", (event) => {
                    value.textContent = event.target.value;
                });
        
                // Objeto para almacenar las polilíneas por vehículo
                let vehiclePolylines = {};
                const colorPalette = ['blue', 'red', 'green', 'purple', 'orange', 'brown', 'pink', 'cyan'];

                // Función para obtener un color único para cada vehículo
                function getVehicleColor(index) {
                    return colorPalette[index % colorPalette.length];
                }

                //Evento del botón de extracción
                extractCoordsBtn.addEventListener("click", async function() {
                    if (lastCircle) {
                        const bounds = lastCircle.getBounds();
                        const latMin = bounds.getSouth();
                        const latMax = bounds.getNorth();
                        const lngMin = bounds.getWest();
                        const lngMax = bounds.getEast();

                        const startDateTime = startDateInput.value;
                        const endDateTime = endDateInput.value;
                        const startDate = startDateTime.split("T")[0];
                        const startTime = startDateTime.split("T")[1];
                        const endDate = endDateTime.split("T")[0];
                        const endTime = endDateTime.split("T")[1];

                        // Obtener todas las placas disponibles
                        const allPlates = Array.from(vehicleDropdown.options)
                            .map(option => option.value)
                            .filter(value => value !== 'todos');
                        console.log(allPlates);    
                        // Determinar qué placas procesar
                        const selectedPlate = vehicleDropdown.value;
                        const platesToProcess = selectedPlate === 'todos' ? allPlates : [selectedPlate];
                        
                        // Limpiar datos anteriores
                        vehiclePolylines = {};
                        limpiarMapa();
                        
                        // Realizar peticiones para cada placa
                        for (let i = 0; i < platesToProcess.length; i++) {
                            const plate = platesToProcess[i];
                            const url = `/apisearch?start_day=${startDate}&end_day=${endDate}&start_hour=${encodeURIComponent(startTime)}&end_hour=${encodeURIComponent(endTime)}&lat_min=${latMin}&lat_max=${latMax}&long_min=${lngMin}&long_max=${lngMax}&placa=${plate}`;
                            console.log(plate);
                            console.log(url);
                            try {
                                const response = await fetch(url);
                                const data = await response.json();
                                vehiclePolylines[plate] = {
                                    data: data.resultados,
                                    color: getVehicleColor(i)
                                };
                            } catch (error) {
                                console.error(`Error al obtener datos para el vehículo ${plate}:`, error);
                            }
                        }

                        actualizarVisualizacion();
                    }
                });

                // Función para limpiar el mapa
                function limpiarMapa() {
                    polylines.forEach(polyline => mapa_2.removeLayer(polyline));
                    polylines = [];
                    pointMarkers.forEach(marker => mapa_2.removeLayer(marker));
                    pointMarkers = [];
                }

                // Función para actualizar la visualización según la selección actual
                function actualizarVisualizacion() {
                    const selectedPlate = vehicleDropdown.value;
                    
                    // Limpiar el selector de polilíneas
                    selectPolyline.innerHTML = '';
                    
                    if (selectedPlate === 'todos') {
                        // Mostrar una polilínea por cada vehículo
                        limpiarMapa();
                        Object.entries(vehiclePolylines).forEach(([plate, vehicleData]) => {
                            const firstKey = Object.keys(vehicleData.data)[0];
                            if (firstKey) {
                                graficarPolilinea(vehicleData.data[firstKey], vehicleData.color, false);
                            }
                        });
                        
                        // Agregar todas las polilíneas al selector
                        Object.entries(vehiclePolylines).forEach(([plate, vehicleData]) => {
                            Object.entries(vehicleData.data).forEach(([key, polyline]) => {
                                agregarOpcionPolilinea(plate, key, polyline, vehicleData.color);
                            });
                        });
                    } else {
                        // Mostrar solo las polilíneas del vehículo seleccionado
                        const vehicleData = vehiclePolylines[selectedPlate];
                        if (vehicleData) {
                            // Agregar las polilíneas al selector
                            Object.entries(vehicleData.data).forEach(([key, polyline]) => {
                                agregarOpcionPolilinea(selectedPlate, key, polyline, vehicleData.color);
                            });
                            
                            // Graficar la primera polilínea
                            const firstKey = Object.keys(vehicleData.data)[0];
                            if (firstKey) {
                                limpiarMapa();
                                graficarPolilinea(vehicleData.data[firstKey], vehicleData.color, true);
                            }
                        }
                    }
                }

                // Función para agregar una opción al selector de polilíneas
                function agregarOpcionPolilinea(plate, key, polyline, color) {
                    const infostartDate = polyline[0].Day;
                    const infoendDay = polyline[polyline.length - 1].Day;
                    const infostartTime = polyline[0].Hour.substring(0, 5);
                    const infoendTime = polyline[polyline.length - 1].Hour.substring(0, 5);

                    const option = document.createElement('option');
                    option.value = `${plate}-${key}`;

                    let timeText;
                    if (infoendDay == infostartDate) {
                        timeText = `El día ${infostartDate}: desde ${infostartTime} hasta ${infoendTime}`;
                    } else {
                        timeText = `De: ${infostartDate} a ${infostartTime}, hasta: ${infoendDay} a ${infoendTime}`;
                    }
                    if (convertirAHorasMinutos(infostartTime) > convertirAHorasMinutos(infoendTime)) {
                        timeText = `El día ${infostartDate}: desde ${infoendTime} hasta ${infostartTime}`;
                    }

                    option.text = `Vehículo ${plate}: ${timeText}`;
                    selectPolyline.appendChild(option);
                }

                // Función para graficar una polilínea
                function graficarPolilinea(coordinates, color = 'blue', ajustarVista = true) {
                    const latLngs = coordinates
                        .map(coord => {
                            const lat = parseFloat(coord.Latitude.trim());
                            const lng = parseFloat(coord.Longitude.trim());
                            return { lat, lng, speed: coord.Speed, rpm: coord.RPM };
                        })
                        .filter(({ lat, lng }) => {
                            const distancia = calcularDistancia(lastCircle.getLatLng().lat, lastCircle.getLatLng().lng, lat, lng);
                            return distancia <= lastCircle.getRadius();
                        });

                    const polyline = L.polyline(latLngs.map(coord => [coord.lat, coord.lng]), { color }).addTo(mapa_2);
                    polylines.push(polyline);

                    // Añadir marcadores de flecha
                    for (let i = 0; i < latLngs.length - 1; i++) {
                        const start = latLngs[i];
                        const end = latLngs[i + 1];
                        const angleRad = Math.atan2(end.lat - start.lat, end.lng - start.lng);
                        const angleDeg = angleRad * (180 / Math.PI);

                        const arrowMarker = L.marker([start.lat, start.lng], {
                            icon: new ArrowIcon(),
                        }).addTo(mapa_2);

                        arrowMarker.getElement().style.transform = `rotate(${angleDeg}deg)`;
                        pointMarkers.push(arrowMarker);

                        arrowMarker.on('mouseover', function() {
                            arrowMarker.bindPopup(`Velocidad: ${start.speed} km/h, RPM: ${start.rpm}`).openPopup();
                        });

                        arrowMarker.on('mouseout', function() {
                            arrowMarker.closePopup();
                        });

                        arrowMarker.on('click', function() {
                            arrowMarker.bindPopup(`Velocidad: ${start.speed} km/h, RPM: ${start.rpm}`).openPopup();
                        });
                    }

                    if (ajustarVista && latLngs.length > 0) {
                        mapa_2.fitBounds(polyline.getBounds());
                    }
                }

                // Event listeners para los selectores
                vehicleDropdown.addEventListener('change', function() {
                    if (Object.keys(vehiclePolylines).length > 0) {
                        actualizarVisualizacion();
                    }
                });

                selectPolyline.addEventListener('change', function() {
                    const [plate, polylineKey] = selectPolyline.value.split('-');
                    const vehicleData = vehiclePolylines[plate];
                    
                    if (vehicleData && vehicleData.data[polylineKey]) {
                        limpiarMapa();
                        graficarPolilinea(vehicleData.data[polylineKey], vehicleData.color, true);
                    }
                });
            
                // Función para calcular la distancia entre dos puntos (en metros)
                function calcularDistancia(lat1, lon1, lat2, lon2) {
                    const R = 6371000; // Radio de la Tierra en metros
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLon = (lon2 - lon1) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                              Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distancia = R * c; // Distancia en metros
                    return distancia;
                }

            } else {
                contenedor_info.classList.remove('activo')
                contenedor_btn.classList.remove('activo')

                if (lastMarker) {
                    mapa_2.removeLayer(lastMarker);
                }
                if (lastCircle) {
                    mapa_2.removeLayer(lastCircle);
                }
            }        
        });
    };
});