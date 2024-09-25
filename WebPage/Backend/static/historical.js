document.addEventListener("DOMContentLoaded", function() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const submitButton = document.getElementById("enviar");
    let mapa_2;
    startDateInput.addEventListener("change", function () {
        // Actualiza el atributo "min" del campo de fecha final para que no pueda ser antes que la fecha de inicio
        endDateInput.min = startDateInput.value;
    });
    
    // Función para validar al enviar
    submitButton.addEventListener("click", function (event) {
        // Si la fecha final es menor que la de inicio, se previene el envío del formulario
        if (endDateInput.value < startDateInput.value) {
            event.preventDefault();
            alert("La fecha final no puede ser anterior a la fecha de inicio.");
            return;
        }
    
        // Obtener los valores de los inputs
        const startDateTime = startDateInput.value;
        const endDateTime = endDateInput.value;
    
        // Descomponer fecha y hora del valor de inicio
        const startDate = startDateTime.split("T")[0]; // Fecha en formato YYYY-MM-DD
        const startTime = startDateTime.split("T")[1]; // Hora en formato HH:MM
    
        // Descomponer fecha y hora del valor final
        const endDate = endDateTime.split("T")[0]; // Fecha en formato YYYY-MM-DD
        const endTime = endDateTime.split("T")[1]; // Hora en formato HH:MM
    
        // Guardar o manipular los valores obtenidos
        console.log("days-hour/?start_day=", startDate, ""); // yyyy-mm-dd
        console.log("Hora de inicio:", startTime); // 00:00
        console.log("Fecha final:", endDate);
        console.log("Hora final:", endTime);
        
        let urlString = `days-hours/?start_day=${startDate}&end_day=${endDate}&start_hour=${encodeURIComponent(startTime)}&end_hour=${encodeURIComponent(endTime)}`;
        
        async function fetchAndDrawRoute() {
            try {
                // URL generada previamente
                let urlString = `days-hours/?start_day=${startDate}&end_day=${endDate}&start_hour=${encodeURIComponent(startTime)}&end_hour=${encodeURIComponent(endTime)}`;
        
                // Hacer la solicitud para obtener los datos
                const response = await fetch(urlString);
                
                // Verificar si la respuesta es correcta
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }
        
                // Convertir la respuesta en formato JSON
                const data = await response.json();
        
                // Obtener los resultados
                const resultados = data.resultados;
        
                // Crear un arreglo para almacenar las coordenadas
                const coordinates = [];
        
                // Iterar sobre los resultados y extraer latitud y longitud
                resultados.forEach(result => {
                    const lat = parseFloat(result.Latitude.trim());  // Asegúrate de eliminar espacios en blanco
                    const lng = parseFloat(result.Longitude.trim());
                    coordinates.push([lat, lng]); // Añadir el par [lat, lng] al arreglo
                });
        
                // Llamar a la función que dibuja la ruta en el mapa
                drawRouteOnMap(coordinates);
        
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        }
        
        function drawRouteOnMap(coordinates) {
            // Dibujar la ruta en el mapa usando las coordenadas
            const route = L.polyline(coordinates, { color: 'blue' }).addTo(mapa_2); // Usar 'mapa' en lugar de 'map'
        
            // Ajustar la vista del mapa para que se ajuste a la ruta
            mapa_2.fitBounds(route.getBounds()); // Usar 'mapa' en lugar de 'map'
        }
    
        fetchAndDrawRoute(); // Ejecutar la función fetchAndDrawRoute al hacer clic en enviar
    });
    
    window.onload = function() {
        // Inicializar el mapa solo una vez
        mapa_2 = L.map("contenedor-mapa-2").setView([10.96854, -74.78132], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_2);
    };
    
});
