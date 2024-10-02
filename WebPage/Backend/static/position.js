window.onload = function () {
    const historicosBtn = document.getElementById("historicos-btn");
    const indexBtn = document.getElementById("index-btn");
    const radioInput = document.getElementById("radio");
    const extractCoordsBtn = document.getElementById("extract-coords-btn");
    let lastMarker = null;
    let lastCircle = null;
    const value = document.querySelector("#value");
    const polylines = [];
    const selectPolyline = document.getElementById('polyline-select');

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

    mapa_3 = L.map("contenedor-mapa-3").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_3);

    mapa_3.on('click', function(e) {
        const { lat, lng } = e.latlng;
        const radius = parseInt(radioInput.value);

        if (lastMarker) {
            mapa_3.removeLayer(lastMarker);
        }
        if (lastCircle) {
            mapa_3.removeLayer(lastCircle);
        }

        lastMarker = L.marker([lat, lng]).addTo(mapa_3);
        lastCircle = L.circle([lat, lng], { radius }).addTo(mapa_3);
        lastMarker.bindPopup(`Coordenadas: Latitud = ${lat}, Longitud = ${lng}`).openPopup();
    });

    radioInput.addEventListener("input", function() {
        if (lastCircle) {
            const radius = parseInt(radioInput.value);
            lastCircle.setRadius(radius);
        }
    });

    value.textContent = radioInput.value;
    radioInput.addEventListener("input", (event) => {
        value.textContent = event.target.value;
    });

    extractCoordsBtn.addEventListener("click", function() {
        if (lastCircle) {
            const bounds = lastCircle.getBounds();
            const latMin = bounds.getSouth();
            const latMax = bounds.getNorth();
            const lngMin = bounds.getWest();
            const lngMax = bounds.getEast();

            const url = `/api/position?lat_min=${latMin}&lat_max=${latMax}&long_min=${lngMin}&long_max=${lngMax}`;
            console.log(`URL generada: ${url}`);

            async function obtenerYGraficarPolilineas() {
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log(data);
                    const resultados = data.resultados;

                    // Validar si 'resultados' es un objeto
                    if (resultados && typeof resultados === 'object') {
                        selectPolyline.innerHTML = '';

                        // Recorrer las claves del objeto 'resultados'
                        for (const key in resultados) {
                            if (resultados.hasOwnProperty(key)) {
                                const polyline = resultados[key];
                                const option = document.createElement('option');
                                option.value = key; // Usar el key como valor
                                option.text = key;  // Mostrar el key como texto en el select
                                selectPolyline.appendChild(option);
                            }
                        }

                        // Escuchar cambios en el selector
                        selectPolyline.addEventListener('change', function () {
                            const selectedPolylineKey = selectPolyline.value;
                            graficarPolilinea(resultados[selectedPolylineKey]); // Pasar el array correspondiente a la polilínea seleccionada
                        });

                        // Graficar la primera polilínea por defecto (si hay resultados)
                        if (Object.keys(resultados).length > 0) {
                            graficarPolilinea(resultados[Object.keys(resultados)[0]]);
                        }
                    } else {
                        console.error('resultados no es un objeto:', resultados);
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
                const latLngs = coordinates.map(coord => [parseFloat(coord.Latitude.trim()), parseFloat(coord.Longitude.trim())]);
                const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(mapa_3);

                // Añadir la nueva polilínea a la lista de polilíneas
                polylines.push(polyline);

                // Ajustar la vista del mapa para que se ajuste a la polilínea
                mapa_3.fitBounds(polyline.getBounds());
            }

            obtenerYGraficarPolilineas();
        }
    });
};