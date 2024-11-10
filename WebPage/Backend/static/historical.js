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


    // Agregar evento de clic
    indexBtn.addEventListener("click", function() {
        // Obtener la URL actual
        const currentURL = window.location.href;

        // Crear la nueva URL reemplazando el complemento
        const newURL = currentURL.replace(/[^/]*$/, "");

        // Redirigir a la nueva URL
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

                if (response.status === 404) {
                    console.log("No se encontraron datos. Error 404.");
                    if (lastRoute) {
                        mapa_2.removeLayer(lastRoute);  // Eliminar la polilínea anterior si existe
                        lastRoute = null;
                    }
                    alert("No se encontraron datos para el rango de fechas seleccionado.");
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }

                const data = await response.json();
                const resultados = data.resultados;


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

        // Array para almacenar las flechas
        let arrows = [];

        // Función para dibujar la ruta en el mapa junto con las flechas
        function drawRouteOnMap(resultados) {
            // Eliminar polilíneas y flechas anteriores si existen
            if (lastRoute) {
                mapa_2.removeLayer(lastRoute);
            }
            arrows.forEach(arrow => {
                mapa_2.removeLayer(arrow);
            });
            arrows = []; // Reiniciar las flechas
        
            // Crear un nuevo array de coordenadas y flechas
            const coordinates = resultados.map(result => [
                parseFloat(result.Latitude.trim()), 
                parseFloat(result.Longitude.trim())
            ]);
        
            // Dibujar la nueva polilínea
            lastRoute = L.polyline(coordinates, { color: 'blue' }).addTo(mapa_2);
            mapa_2.fitBounds(lastRoute.getBounds());
        
            // Agregar flechas de dirección con popups
            for (let i = 0; i < resultados.length - 1; i++) {
                const pointA = L.latLng(
                    parseFloat(resultados[i].Latitude.trim()), 
                    parseFloat(resultados[i].Longitude.trim())
                );
                const pointB = L.latLng(
                    parseFloat(resultados[i + 1].Latitude.trim()), 
                    parseFloat(resultados[i + 1].Longitude.trim())
                );
        
                // Calcular el ángulo entre dos puntos
                const angle = Math.atan2(
                    pointB.lat - pointA.lat, 
                    pointB.lng - pointA.lng
                ) * (180 / Math.PI);
        
                // Crear una flecha usando un icono CSS personalizado
                const arrowIcon = L.divIcon({
                    className: 'arrow-icon',
                    html: '<div class="arrow"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
        
                // Colocar la flecha en el punto medio entre A y B y rotarla
                const midpoint = L.latLng(
                    (pointA.lat + pointB.lat) / 2, 
                    (pointA.lng + pointB.lng) / 2
                );
                const arrowMarker = L.marker(midpoint, { icon: arrowIcon, rotationAngle: angle }).addTo(mapa_2);
        
                // Agregar el popup solo al pasar el ratón o hacer clic
                const velocidad = resultados[i].Speed;
                const rpm = resultados[i].RPM;
                const popupContent = `Velocidad: ${velocidad} km/h<br>RPM: ${rpm}`;
        
                arrowMarker.on('mouseover', () => {
                    arrowMarker.bindPopup(popupContent).openPopup();
                });
                arrowMarker.on('mouseout', () => {
                    arrowMarker.closePopup();
                });
                arrowMarker.on('click', () => {
                    arrowMarker.bindPopup(popupContent).openPopup();
                });
        
                arrows.push(arrowMarker); // Agregar a la lista de flechas
            }
        }        


        fetchAndDrawRoute();
    });
    function convertirAHorasMinutos(hora) {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos; // Convertir a minutos totales
    }
    

    window.onload = function() {
        mapa_2 = L.map("contenedor-mapa-2").setView([10.96854, -74.78132], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_2);

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
                        const url = `/apisearch?start_day=${startDate}&end_day=${endDate}&start_hour=${encodeURIComponent(startTime)}&end_hour=${encodeURIComponent(endTime)}&lat_min=${latMin}&lat_max=${latMax}&long_min=${lngMin}&long_max=${lngMax}`;
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
            

                                            const infostartDate =polyline[0].Day;
                                            const infoendDay=polyline[polyline.length - 1].Day; 
                                            const infostartTime =polyline[0].Hour.substring(0, 5);;
                                            const infoendTime=polyline[polyline.length - 1].Hour.substring(0, 5);; 
            
                                            const option = document.createElement('option');
                                            option.value = key; // Usar el key del objeto como valor
                                            if (infoendDay==infostartDate){

                                            option.text = `El dia ${infostartDate}: desde ${infostartTime}
                                            ,Hasta: ${infoendTime}`;
                                            
                                            } else
                                            {
                                                option.text = `De: ${infostartDate} a ${infostartTime}
                                                , hasta: ${infoendDay} a ${infoendTime}`; // Mostrar datetime
                                            }
                                            if(convertirAHorasMinutos(infostartTime)>convertirAHorasMinutos(infoendTime)){
                                                option.text = `El dia ${infostartDate}: desde ${infoendTime}
                                                ,Hasta: ${infostartTime}`;
                                            }
                                         
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

                        let pointMarkers = [];
                        // Función para graficar una polilínea
                        // Definir un icono de flecha con CSS
                        const ArrowIcon = L.DivIcon.extend({
                            options: {
                                className: 'arrow-marker', // Clase CSS para el marcador de flecha
                                iconSize: [20, 20], // Tamaño de la flecha
                            }
                        });

                        function graficarPolilinea(coordinates) {
                            // Eliminar polilíneas y marcadores anteriores
                            polylines.forEach(polyline => {
                                mapa_2.removeLayer(polyline);
                            });
                            polylines = [];

                            pointMarkers.forEach(marker => {
                                mapa_2.removeLayer(marker);
                            });
                            pointMarkers = [];

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

                            // Crear la polilínea con las coordenadas filtradas
                            const polyline = L.polyline(latLngs.map(coord => [coord.lat, coord.lng]), { color: 'blue' }).addTo(mapa_2);
                            polylines.push(polyline);

                            // Añadir marcadores de flecha en cada punto
                            for (let i = 0; i < latLngs.length - 1; i++) {
                                const start = latLngs[i];
                                const end = latLngs[i + 1];

                                // Calcular el ángulo entre los puntos (en radianes)
                                const angleRad = Math.atan2(end.lat - start.lat, end.lng - start.lng);
                                const angleDeg = angleRad * (180 / Math.PI); // Convertir a grados

                                // Crear el marcador de flecha con rotación
                                const arrowMarker = L.marker([start.lat, start.lng], {
                                    icon: new ArrowIcon(),
                                }).addTo(mapa_2);

                                // Aplicar la rotación de la flecha usando CSS
                                arrowMarker.getElement().style.transform = `rotate(${angleDeg}deg)`;

                                // Guardar el marcador en el arreglo para eliminarlo después
                                pointMarkers.push(arrowMarker);

                                // Añadir eventos para mostrar el popup
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

                            // Ajustar la vista del mapa para la nueva polilínea
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