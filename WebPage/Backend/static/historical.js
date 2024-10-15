document.addEventListener("DOMContentLoaded", function() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const submitButton = document.getElementById("enviar");
    let mapa_2;
    let lastRoute = null; // Variable para almacenar la última polilínea
    const indexBtn = document.getElementById("index-btn");
    const positionBtn = document.getElementById("position-btn");
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


    // Agregar evento de clic
    indexBtn.addEventListener("click", function() {
        // Obtener la URL actual
        const currentURL = window.location.href;

        // Crear la nueva URL reemplazando el complemento
        const newURL = currentURL.replace(/[^/]*$/, "");

        // Redirigir a la nueva URL
        window.location.href = newURL;
    });

    positionBtn.addEventListener("click", function() {
        const currentURL = window.location.href
        const newURL = currentURL.replace(/[^/]*$/, "position");
        window.location.href = newURL;
    });

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
    submitButton.addEventListener("click", function (event) {   //
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
        const endDate = endDateTime.split("T")[0];
        const endTime = endDateTime.split("T")[1];

        // Usar URLSearchParams para construir la cadena de consulta
        const params = new URLSearchParams({
            start_day: startDate,
            end_day: endDate,
            start_hour: encodeURIComponent(startTime),
            end_hour: encodeURIComponent(endTime)      
        });

        const urlString = `days-hours/?${params.toString()}`;
        console.log(urlString)

        async function fetchAndDrawRoute() {
            try {
                const response = await fetch(urlString);
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }

                const data = await response.json();
                const resultados = data.resultados;

                if (resultados.length === 0) {
                    // Si no hay resultados, eliminar la polilínea anterior y mostrar alerta
                    if (lastRoute) {
                        mapa_2.removeLayer(lastRoute);
                        lastRoute = null; // Resetear la variable
                    }
                    alert("No se encontraron datos para el rango de fechas seleccionado.");
                    return;
                }

                const coordinates = [];
                resultados.forEach(result => {
                    const lat = parseFloat(result.Latitude.trim());
                    const lng = parseFloat(result.Longitude.trim());
                    coordinates.push([lat, lng]);
                });

                drawRouteOnMap(coordinates);

            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        }

        function drawRouteOnMap(coordinates) {
            // Eliminar la polilínea anterior si existe
            if (lastRoute) {
                mapa_2.removeLayer(lastRoute);
            }

            // Dibujar la nueva polilínea
            lastRoute = L.polyline(coordinates, { color: 'blue' }).addTo(mapa_2);
            mapa_2.fitBounds(lastRoute.getBounds());
        }

        fetchAndDrawRoute();
    });

    window.onload = function() {
        mapa_2 = L.map("contenedor-mapa-2").setView([10.96854, -74.78132], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_2);

        filtro_posicion.addEventListener("change", (event) => {
            if (event.target.checked){
                contenedor_info.classList.add('activo')
                contenedor_btn.classList.add('activo')

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
        
                extractCoordsBtn.addEventListener("click", function() {
                    if (lastCircle) {
                        const bounds = lastCircle.getBounds(); // Obtener los límites del círculo
                        const latMin = bounds.getSouth(); // Latitud mínima
                        const latMax = bounds.getNorth(); // Latitud máxima
                        const lngMin = bounds.getWest();  // Longitud mínima
                        const lngMax = bounds.getEast();  // Longitud máxima
        
                        const startDateTime = startDateInput.value;
                        const endDateTime = endDateInput.value;
                        const startDate = startDateTime.split("T")[0];
                        const startTime = startDateTime.split("T")[1];
                        const endDate = endDateTime.split("T")[0];
                        const endTime = endDateTime.split("T")[1];
                    
                        // Mostrar los valores en la consola
                        console.log(`Latitud mínima: ${latMin}, Latitud máxima: ${latMax}`);
                        console.log(`Longitud mínima: ${lngMin}, Longitud máxima: ${lngMax}`);
            
                        // Construir la URL de la query GET
                        const url = `/api/position?lat_min=${latMin}&lat_max=${latMax}&long_min=${lngMin}&long_max=${lngMax}&start_day=${startDate}&end_day=${endDate}&start_hour=${encodeURIComponent(startTime)}&end_hour=${encodeURIComponent(endTime)}`;
                        console.log(`URL generada: ${url}`);
            
                        // Hacer la petición GET usando fetch
                        async function obtenerYGraficarPolilineas() {
                            try {
                                const response = await fetch(url);
                                const data = await response.json();
                                console.log(data); // Agrega este log para verificar la respuesta
                                const resultados = data.resultados;
            
                                // Comprobar si resultados es un objeto
                                if (resultados && typeof resultados === 'object') {
                                    // Vaciar el selector de polilíneas
                                    selectPolyline.innerHTML = '';
            
                                    for (const key in resultados) {
                                        if (resultados.hasOwnProperty(key)) {
                                            const polyline = resultados[key];
            
                                            // Obtener datetime inicial y final
                                            const startDatetime = polyline[0].datetime; // Primer elemento
                                            const endDatetime = polyline[polyline.length - 1].datetime; // Último elemento
            
                                            const option = document.createElement('option');
                                            option.value = key; // Usar el key del objeto como valor
                                            option.text = `Desde: ${startDatetime}, Hasta: ${endDatetime}`; // Mostrar datetime
                                            selectPolyline.appendChild(option);
                                        }
                                    }
            
                                    selectPolyline.addEventListener('change', function () {
                                        const selectedPolylineIndex = selectPolyline.value;
                                        graficarPolilinea(resultados[selectedPolylineIndex]);
                                    });
            
                                    // Graficar la primera polilínea por defecto
                                    if (Object.keys(resultados).length > 0) {
                                        graficarPolilinea(resultados[Object.keys(resultados)[0]]);
                                    }
                                } else {
                                    console.error('resultados no es un objeto o está vacío:', resultados);
                                }
                            } catch (error) {
                                console.error('Error al obtener las polilíneas:', error);
                            }
                        }
            
                        // Función para graficar una polilínea
                        function graficarPolilinea(coordinates) {
                            // Eliminar las polilíneas anteriores
                            polylines.forEach(polyline => {
                                mapa_2.removeLayer(polyline);
                            });
            
                            // Filtrar solo las coordenadas dentro del círculo
                            const latLngs = coordinates
                                .map(coord => [parseFloat(coord.Latitude.trim()), parseFloat(coord.Longitude.trim())])
                                .filter(([lat, lng]) => {
                                    const distancia = calcularDistancia(lastCircle.getLatLng().lat, lastCircle.getLatLng().lng, lat, lng);
                                    return distancia <= lastCircle.getRadius(); // Filtrar solo puntos dentro del círculo
                                });
            
                            // Crear una nueva polilínea con las coordenadas filtradas
                            const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(mapa_2);
            
                            // Añadir la nueva polilínea a la lista de polilíneas
                            polylines.push(polyline);
            
                            // Ajustar la vista del mapa para que se ajuste a la polilínea
                            if (latLngs.length > 0) {
                                mapa_2.fitBounds(polyline.getBounds());
                            }
                        }
            
                        obtenerYGraficarPolilineas(); // Llamar a la función para obtener y graficar polilíneas
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
            }        
        });

        

    };
});