window.onload = function () {
    const historicosBtn = document.getElementById("historicos-btn");
    const indexBtn = document.getElementById("index-btn");
    const radioInput = document.getElementById("radio"); // Obtener el input range
    const extractCoordsBtn = document.getElementById("extract-coords-btn");
    let lastMarker = null; // Variable para almacenar el último marcador
    let lastCircle = null; // Variable para almacenar el último círculo
    const value = document.querySelector("#value");
    const input = document.querySelector("#radio");
    const polylines = []; // Almacenar polilíneas en el mapa
    const selectPolyline = document.createElement('select'); // Selector para polilíneas
    document.body.appendChild(selectPolyline); // Añadir al cuerpo de la página

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
            async function obtenerYGraficarPolilineas() {
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log(data); // Agrega este log para verificar la respuesta
                    const resultados = data.resultados;
            
                    // Comprobar si resultados es un array
                    if (Array.isArray(resultados)) {
                        // Vaciar el selector de polilíneas
                        selectPolyline.innerHTML = '';
            
                        resultados.forEach((resultado, index) => {
                            const option = document.createElement('option');
                            option.value = index;
                            option.text = `Polilínea ${index + 1}`;
                            selectPolyline.appendChild(option);
                        });
            
                        selectPolyline.addEventListener('change', function () {
                            const selectedPolylineIndex = selectPolyline.value;
                            graficarPolilinea(resultados[selectedPolylineIndex].poliline);
                        });
            
                        // Graficar la primera polilínea por defecto
                        if (resultados.length > 0) {
                            graficarPolilinea(resultados[0].poliline);
                        }
                    } else {
                        console.error('resultados no es un array:', resultados);
                    }
                } catch (error) {
                    console.error('Error al obtener las polilíneas:', error);
                }
            }
            
        
            // Función para graficar una polilínea
            function graficarPolilinea(coordinates) {
                // Eliminar las polilíneas anteriores
                polylines.forEach(polyline => {
                    mapa_3.removeLayer(polyline);
                });
        
                // Crear una nueva polilínea con las coordenadas recibidas
                const latLngs = coordinates.map(coord => [parseFloat(coord.Latitude), parseFloat(coord.Longitude)]);
                const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(mapa_3);
        
                // Añadir la nueva polilínea a la lista de polilíneas
                polylines.push(polyline);
        
                // Ajustar la vista del mapa para que se ajuste a la polilínea
                mapa_3.fitBounds(polyline.getBounds());
            }
        
            obtenerYGraficarPolilineas(); // Llamar a la función para obtener y graficar polilíneas
        };
    });
};