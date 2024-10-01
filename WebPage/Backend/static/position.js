let mapa_3

window.onload = function () {
    const historicosBtn = document.getElementById("historicos-btn");
    const indexBtn = document.getElementById("index-btn");
    // Agregar evento de clic
    historicosBtn.addEventListener("click", function() {
        // Obtener la URL actual
        const currentURL = window.location.href;
        
        // Crear la nueva URL reemplazando el complemento
        const newURL = currentURL.replace(/[^/]*$/, "historical.html");
        
        // Redirigir a la nueva URL
        window.location.href = newURL;
    });
    indexBtn.addEventListener("click", function() {
        const currentURL = window.location.href;
        const newURL = currentURL.replace(/[^/]*$/, "index.html");
        window.location.href = newURL;
    });
    
    mapa_3 = L.map("contenedor-mapa-3").setView([10.96854, -74.78132], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapa_3);
};


