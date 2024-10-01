document.addEventListener("DOMContentLoaded", function() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const submitButton = document.getElementById("enviar");
    let mapa_2;

    const indexBtn = document.getElementById("index-btn");
    const positionBtn = document.getElementById("position-btn");
    // Agregar evento de clic
    indexBtn.addEventListener("click", function() {
        // Obtener la URL actual
        const currentURL = window.location.href;

        // Crear la nueva URL reemplazando el complemento
        const newURL = currentURL.replace(/[^/]*$/, "index.html");

        // Redirigir a la nueva URL
        window.location.href = newURL;
    });

    positionBtn.addEventListener("click", function() {
        const currentURL = window.location.href
        const newURL = currentURL.replace(/[^/]*$/, "position.html");
        window.location.href = newURL;
    });

    // Función que se ejecuta cuando cambia la fecha de inicio
    startDateInput.addEventListener("change", function () {
        endDateInput.min = startDateInput.value;
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
            const route = L.polyline(coordinates, { color: 'blue' }).addTo(mapa_2);
            mapa_2.fitBounds(route.getBounds());
        }

        fetchAndDrawRoute();
    });

    window.onload = function() {
        mapa_2 = L.map("contenedor-mapa-2").setView([10.96854, -74.78132], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_2);
    };
});