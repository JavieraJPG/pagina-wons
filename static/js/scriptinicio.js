(function () {
    const ACCESS_FLAG = "menuAccess";
    const PASSWORD = "wonsito";
    const input = document.getElementById("pass");
    const button = document.getElementById("entrarBtn");
    const errorBox = document.getElementById("mensajeError");
    const capaEstatica = document.getElementById("estatica");

    // Sonido de acceso correcto
    const sonidoAcceso = new Audio("ingreso_de_contrasena.m4a");

    function mostrarError(msg) {
        errorBox.textContent = msg;
    }

    function activarEstatica() {
        if (capaEstatica) {
            capaEstatica.classList.add("activa");
        }
    }

    function desactivarEstatica() {
        if (capaEstatica) {
            capaEstatica.classList.remove("activa");
        }
    }

    function irAlMenu() {
        window.location.href = "menu.html";
    }

    function reproducirTeclado() {
        // nuevo audio por cada tecla (más seguro)
        const s = new Audio("teclado.m4a");
        s.volume = 0.7;
        s.play().catch((err) => {
            console.error("Error al reproducir sonido de teclado:", err);
        });
    }

    function intentarAcceso() {
        const value = (input.value || "").trim();

        if (!value) {
            mostrarError("La contraseña es obligatoria.");
            return;
        }

        if (value === PASSWORD) {
            sessionStorage.setItem(ACCESS_FLAG, "true");

            activarEstatica();

            sonidoAcceso.play().then(() => {
                sonidoAcceso.onended = function () {
                    irAlMenu();
                };

                // Seguro por si onended no se dispara
                setTimeout(irAlMenu, 4000);
            }).catch((err) => {
                console.error("Error al reproducir sonido de acceso:", err);
                irAlMenu();
            });

        } else {
            mostrarError("Contraseña incorrecta. Intenta nuevamente.");
            desactivarEstatica();
        }
    }

    // Sonido al escribir
    input.addEventListener("keydown", (event) => {
        const teclasSinSonido = ["Tab", "Escape", "Shift", "Control", "Alt"];
        if (teclasSinSonido.includes(event.key)) return;

        reproducirTeclado();
    });

    button.addEventListener("click", intentarAcceso);

    input.addEventListener("input", () => {
        mostrarError("");
        desactivarEstatica();
    });

    input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            intentarAcceso();
        }
    });
})();
