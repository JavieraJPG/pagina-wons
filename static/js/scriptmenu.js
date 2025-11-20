(function () {
    const ACCESS_FLAG = "menuAccess";

    // Proteger acceso
    if (sessionStorage.getItem(ACCESS_FLAG) !== "true") {
        window.location.replace("index.html");
        return;
    }

    const linkCuestionario = document.getElementById("irCuestionario");
    const capaApagado = document.getElementById("apagado");

    //Sonido de apagado
    const sonidoApagado = new Audio("../sonido.mp3");


    if (linkCuestionario && capaApagado) {
        linkCuestionario.addEventListener("click", function (event) {
            event.preventDefault();

            // Activamos el apagado visual
            capaApagado.classList.add("activo");

            // Reproducimos sonido de apagado
            sonidoApagado.currentTime = 0;
            sonidoApagado.play().catch(err => console.error(err));

            // Esperar a que termine animación y sonido (~0.7s)
            setTimeout(function () {
                window.location.href = linkCuestionario.href;
            }, 2200);

        });
    }
})();
