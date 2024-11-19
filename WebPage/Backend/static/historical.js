document.addEventListener("DOMContentLoaded", function() {
    let mapa_2;
    let lastRoute = null; // Variable para almacenar la última polilínea
    let lastMarker = null; // Variable para almacenar el último marcador
    let lastCircle = null; // Variable para almacenar el último círculo
    let currentSearchMode = null;
    let polylines = []; // Almacenar polilíneas en el mapa
    let vehiclePlates = [];
    let pointMarkers = []; //almacena el marker
    let arrows = []; // Variable global para almacenar los marcadores de flechas
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const submitButton = document.getElementById("enviar");
    const indexBtn = document.getElementById("index-btn");
    let plateSelect = document.getElementById('plate-select');
    const radioInput = document.getElementById("radio"); // Obtener el input range
    const filtro_posicion= document.getElementById("position-switch")
    const extractCoordsBtn = document.getElementById("extract-coords-btn");
    const contenedor_info = document.querySelector('.contenedor-info')
    const contenedor_btn = document.querySelector('.contenedor-btn')
    const value = document.querySelector("#value");
    const selectPolyline = document.querySelector('.polyline-select'); // Usar el selector ya existente
    const selectPolyline_2 = document.querySelector('.polyline-select-2');
    const contenedor_switch = document.querySelector('.contenedor-switch');
    const polilinea = document.querySelector('.polineas');

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

    function limpiarTodo() {
        mapa_2.eachLayer(layer => {
            // Mantener solo el tile layer (capa base del mapa) y los layers de lastMarker y lastCircle
            if (layer !== lastCircle && layer !== lastMarker && !layer._url) {
                mapa_2.removeLayer(layer);
            }
        });
    }
    
    // Función para validar al enviar
    submitButton.addEventListener("click", function (event) {


        if (!startDateInput.value || !endDateInput.value) {
            event.preventDefault();
            alert("Por favor, selecciona ambas fechas antes de presionar el botón.");
            return;
        } else {
            contenedor_switch.classList.add('activo')
        }

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

                currentSearchMode = 'time';
                limpiarTodo();

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
        
                    if (plateSelect.value!="all") {
                        // Filtrar las rutas de los vehículos y solo mostrar la seleccionada
                        const filteredRoute = allRoutes.find(route => route.plate === plateSelect.value);
                        if (filteredRoute) {
                            limpiarTodo();
                            drawRouteOnMap(filteredRoute.results, plateSelect.value,"linea 268");
                        }
                    } else {
                        // Si no hay placa seleccionada, mostrar todas las rutas
                        allRoutes.forEach(route => {
                            drawRouteOnMap(route.results, route.plate,"Linea 273");
                        });
                    }
                }
        
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        }
    
        // Función para dibujar la ruta en el mapa
        function drawRouteOnMap(resultados, plate,linea) {
            if (currentSearchMode !== 'time') return;
            if(plateSelect.value !="all"){
            
                // Limpiar polilíneas y flechas anteriores si existen
                if (lastRoute) {
                    mapa_2.removeLayer(lastRoute);
                }
                arrows.forEach(arrow => {
                    mapa_2.removeLayer(arrow);
                });
                arrows = []; // Reiniciar las flechas
            }
            console.log(`Linea -${linea}`)
            // Obtener las coordenadas y datos adicionales
            const coordinates = resultados.map(result => ({
                lat: parseFloat(result.Latitude.trim()),
                lng: parseFloat(result.Longitude.trim()),
                speed: result.Speed, // Velocidad del resultado
                rpm: result.RPM // RPM del resultado
            }));
        
            // Asignar un color diferente a cada placa
            const color = getVehicleColor(plate);
        
            // Dibujar la nueva polilínea con un color distinto para cada vehículo
            lastRoute = L.polyline(
                coordinates.map(coord => [coord.lat, coord.lng]),
                { color: color }
            ).addTo(mapa_2);
        
            mapa_2.fitBounds(lastRoute.getBounds());
        
            // Crear flechas en cada segmento
            for (let i = 0; i < coordinates.length - 1; i++) {
                const start = coordinates[i];
                const end = coordinates[i + 1];
        
                // Calcular el ángulo entre los puntos en radianes
                const angleRad = Math.atan2(end.lat - start.lat, end.lng - start.lng);
        
                // Convertir a grados (Leaflet rota en grados en sentido horario)
                const angleDeg = (angleRad * 180) / Math.PI;
        
                // Crear un ícono SVG personalizado
                const arrowIcon = L.divIcon({
                    className: '',
                    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${angleDeg})">
                            <path d="M12 19l7-7-7-7M5 12h14"></path>
                           </svg>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
        
                // Crear un marcador para la flecha
                const arrowMarker = L.marker([start.lat, start.lng], { icon: arrowIcon }).addTo(mapa_2);
        
                // Agregar popup al marcador
                arrowMarker.bindPopup(
                    `Velocidad: ${start.speed} km/h<br>RPM: ${start.rpm}`,
                    { closeButton: false }
                );
        
                // Configurar eventos para mostrar/ocultar popup
                arrowMarker.on('mouseover', function () {
                    this.openPopup();
                });
                arrowMarker.on('mouseout', function () {
                    this.closePopup();
                });
        
                // Almacenar el marcador en el array de flechas
                arrows.push(arrowMarker);
            }
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
                    limpiarTodo();
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

                        if (plateSelect.value.toLowerCase() === "all") {
                            polilinea.classList.add('activo');
                            selectPolyline_2.classList.add('activo');
                            selectPolyline.classList.add('activo');
                            console.log(plateSelect.value);
                        } else {
                            selectPolyline_2.classList.remove('activo');
                            polilinea.classList.add('activo');
                            selectPolyline.classList.add('activo');
                        }

                        currentSearchMode = 'position';
                        
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
                        const allPlates = Array.from(plateSelect.options)
                            .map(option => option.value)
                            .filter(value => value !== 'todos');
                        console.log(allPlates);    
                        // Determinar qué placas procesar
                        const selectedPlate = plateSelect.value;
                        const platesToProcess = selectedPlate === 'Todas' ? allPlates : ["MXL306","LOK123"];
                        
                        // Limpiar datos anteriores
                        vehiclePolylines = {};
                        limpiarTodo();
                        
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

                        
                    }
                    actualizarVisualizacion();
                });

            
                
                // Función para actualizar la visualización según la selección actual
                function actualizarVisualizacion() {
                    if (currentSearchMode !== 'position') return;
                
                    const selectedPlate = plateSelect.value;
                
                    // Limpiar el selector de polilíneas
                    selectPolyline.innerHTML = '';
                
                    // Limpiar el mapa solo una vez antes de agregar nuevas polilíneas
                    limpiarTodo();
                
                    if (selectedPlate == 'all') {
                        const listPlate = ["MXL306", "LOK123"];
                        console.log("Se cumplio");
                        listPlate.forEach(plate => { // Recorrer todos los vehículos y sus polilíneas
                            const vehicleData = vehiclePolylines[plate];
                            console.log(vehicleData);
                            if (vehicleData) {
                                // Agregar las polilíneas al selector
                                Object.entries(vehicleData.data).forEach(([key, polyline]) => {
                                    const dropdown = plate === 'MXL306' ? selectPolyline : selectPolyline_2; 
                                    agregarOpcionPolilinea(plate, key, polyline, vehicleData.color, dropdown); // Usar 'plate' en lugar de 'selectedPlate'
                                });
                    
                                // Graficar la primera polilínea del vehículo
                                const firstKey = Object.keys(vehicleData.data)[0];
                                if (firstKey) {
                                    graficarPolilinea(vehicleData.data[firstKey], vehicleData.color, true);
                                }
                            }
                        });
                    } else {
                        console.log("no se cumplio");
                        // Mostrar solo las polilíneas del vehículo seleccionado
                        const vehicleData = vehiclePolylines[selectedPlate];

                        if (vehicleData) {
                            // Agregar las polilíneas al selector
                            Object.entries(vehicleData.data).forEach(([key, polyline]) => {
                                agregarOpcionPolilinea(selectedPlate, key, polyline, vehicleData.color, selectPolyline);
                            });
                            
                            // Graficar la primera polilínea del vehículo
                            const firstKey = Object.keys(vehicleData.data)[0];
                            if (firstKey) {
                                graficarPolilinea(vehicleData.data[firstKey], vehicleData.color, true);
                            }
                        }
                    }
                }
                

                // Función para agregar una opción al selector de polilíneas
                function agregarOpcionPolilinea(plate, key, polyline, color, dropdown) {
                    const infostartDate = polyline[0].Day;
                    const infoendDay = polyline[polyline.length - 1].Day;
                    const infostartTime = polyline[0].Hour.substring(0, 5);
                    const infoendTime = polyline[polyline.length - 1].Hour.substring(0, 5);
                
                    const option = document.createElement('option');
                    option.value = `${plate}-${key}`;
                
                    let timeText;
                    if (infoendDay === infostartDate) {
                        timeText = `El día ${infostartDate}: desde ${infostartTime} hasta ${infoendTime}`;
                    } else {
                        timeText = `De: ${infostartDate} a ${infostartTime}, hasta: ${infoendDay} a ${infoendTime}`;
                    }
                    if (convertirAHorasMinutos(infostartTime) > convertirAHorasMinutos(infoendTime)) {
                        timeText = `El día ${infostartDate}: desde ${infoendTime} hasta ${infostartTime}`;
                    }
                
                    option.text = `Vehículo ${plate}: ${timeText}`;
                    dropdown.appendChild(option); // Agrega la opción al dropdown específico
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
                            const distancia = calcularDistancia(
                                lastCircle.getLatLng().lat,
                                lastCircle.getLatLng().lng,
                                lat,
                                lng
                            );
                            return distancia <= lastCircle.getRadius();
                        });
                
                    // Dibujar la polilínea
                    let polyline = L.polyline(latLngs.map(coord => [coord.lat, coord.lng]), { color }).addTo(mapa_2);
                    polylines.push(polyline);
                
                    // Añadir flechas de dirección
                    for (let i = 0; i < latLngs.length - 1; i++) {
                        const start = latLngs[i];
                        const end = latLngs[i + 1];
                
                        // Calcular el ángulo en radianes entre los puntos
                        const angleRad = Math.atan2(end.lat - start.lat, end.lng - start.lng);
                
                        // Convertir el ángulo a grados para la rotación CSS
                        const angleDeg = (angleRad * 180) / Math.PI;
                
                        // Crear un marcador de flecha
                        const arrowMarker = L.marker([start.lat, start.lng], {
                            icon: L.divIcon({
                                className: 'arrow-icon',
                                html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${angleDeg})">
                                        <path d="M12 19l7-7-7-7M5 12h14"></path>
                                        </svg>`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }).addTo(mapa_2);
                
                        // Aplicar la rotación al marcador usando CSS
                        const arrowElement = arrowMarker.getElement();
                        if (arrowElement) {
                            arrowElement.style.transform = `rotate(${angleDeg}deg)`;
                        }
                
                        // Agregar popups con velocidad y RPM
                        arrowMarker.bindPopup(`Velocidad: ${start.speed} km/h<br>RPM: ${start.rpm}`, {
                            closeButton: false
                        });
                
                        // Mostrar/ocultar popups al pasar el ratón o hacer clic
                        arrowMarker.on('mouseover', function () {
                            this.openPopup();
                        });
                        arrowMarker.on('mouseout', function () {
                            this.closePopup();
                        });
                
                        arrowMarker.on('click', function () {
                            this.openPopup();
                        });
                
                        pointMarkers.push(arrowMarker);
                    }
                
                    // Ajustar la vista del mapa para mostrar la polilínea
                    if (ajustarVista && latLngs.length > 0) {
                        mapa_2.fitBounds(polyline.getBounds());
                    }
                }

                

                selectPolyline.addEventListener('change', function() {
                    if (currentSearchMode !== 'position') return; // Solo procesar si estamos en modo posición
                    
                    const [plate, polylineKey] = selectPolyline.value.split('-');
                    const vehicleData = vehiclePolylines[plate];
                    
                    if (vehicleData && vehicleData.data[polylineKey]) {
                        limpiarTodo();
                        graficarPolilinea(vehicleData.data[polylineKey], vehicleData.color, true);
                    }
                });

                selectPolyline_2.addEventListener('change', function() {
                    if (currentSearchMode !== 'position') return; // Solo procesar si estamos en modo posición
                    
                    const [plate, polylineKey] = selectPolyline_2.value.split('-');
                    const vehicleData = vehiclePolylines[plate];
                    
                    if (vehicleData && vehicleData.data[polylineKey]) {
                        limpiarTodo();
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
                polilinea.classList.remove('activo')
                selectPolyline_2.classList.remove('activo');
                selectPolyline.classList.remove('activo');

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