document.addEventListener("DOMContentLoaded", function() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const submitButton = document.getElementById("enviar");
    let mapa_2;

    startDateInput.addEventListener("change", function () {
        endDateInput.min = startDateInput.value;
    });

    submitButton.addEventListener("click", function (event) {
        if (endDateInput.value < startDateInput.value) {
            event.preventDefault();
            alert("La fecha final no puede ser anterior a la fecha de inicio.");
            return;
        }

        const [startDate, startTime] = startDateInput.value.split("T");
        const [endDate, endTime] = endDateInput.value.split("T");
        
        const urlString = buildUrl(startDate, endDate, startTime, endTime);
        fetchAndDrawRoute(urlString);
    });

    function buildUrl(startDate, endDate, startTime, endTime) {
        return `days-hours/?start_day=${startDate}&end_day=${endDate}&start_hour=${encodeURIComponent(startTime)}&end_hour=${encodeURIComponent(endTime)}`;
    }

    async function fetchAndDrawRoute(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);

            const data = await response.json();
            console.log(data); // Para verificar la respuesta de la API

            const resultados = data.resultados;
            if (!Array.isArray(resultados) || resultados.length === 0) {
                alert("No se encontraron resultados.");
                return;
            }

            const coordinates = resultados.map(result => [
                parseFloat(result.Latitude.trim()),
                parseFloat(result.Longitude.trim())
            ]);

            console.log("Coordenadas:", coordinates); // Para verificar las coordenadas
            drawRouteOnMap(coordinates);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            alert("Hubo un problema al obtener los datos. Inténtalo de nuevo más tarde.");
        }
    }

    function drawRouteOnMap(coordinates) {
        const route = L.polyline(coordinates, { color: 'blue' }).addTo(mapa_2);
        mapa_2.fitBounds(route.getBounds());
    }

    window.onload = function() {
        mapa_2 = L.map("contenedor-mapa-2").setView([10.96854, -74.78132], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa_2);
    };
});