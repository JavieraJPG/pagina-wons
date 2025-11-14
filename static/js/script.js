// ===============================
// PREGUNTAS
// ===============================
const questions = [
    {
        text: "1. ¿Tanga-nanica o tanga-nana?",
        name: "p1",
        options: ["tanga-nanica", "tanga-nana"]
    },
    {
        text: "2. ¿Qué personaje de WWE eres?",
        name: "p2",
        options: ["John Cena", "Undertaker", "La Roca", "Triple H"]
    },
    {
        text: "3. ¿Qué número te gusta más?",
        name: "p3",
        options: ["666", "3.14", "11", "69"]
    },
    {
        text: "4. ¿Tu color favorito?",
        name: "p4",
        options: ["Negro", "Rosa", "Rojo", "Ninguno"]
    },
    {
        text: "5. ¿Qué horóscopo te representa?",
        name: "p5",
        options: ["Escorpio", "Libra", "Acuario", "Virgo"]
    },
    {
        text: "6. Si estuvieras en un anime shonen, ¿quién serías?",
        name: "p6",
        options: ["Goku", "Seiya", "Naruto", "One Piece"]
    },
    {
        text: "7. ¿Cómo duermes?",
        name: "p7",
        options: [
            "De lado izquierdo",
            "De espalda",
            "De lado derecho",
            "Con los ojos cerrados 😆"
        ]
    }
];

// ===============================
// EQUIPOS PARA LA RULETA
// ===============================
const teams = [
    { name: "Apóstoles de Nashito", color: "#ff1744" },     // rojo
    { name: "Los Loleros", color: "#2979ff" },              // azul
    { name: "Callampa FC", color: "#ffffff" },              // blanco
    { name: "Deportes Chuchunco City", color: "#00e676" },  // verde
    { name: "Enanito FC", color: "#000000" },               // negro
    { name: "Orgullo CDF", color: "#ffeb3b" },              // amarillo
    { name: "Wons United", color: "#ff80ab" }               // rosado
];

// ===============================
// VARIABLES DE ESTADO
// ===============================
let currentIndex = 0;
const answers = {};
let runCount = 0;                 // cuántas personas van (máx 7)
const assignedTeams = [];         // equipos ya usados

// ===============================
// ELEMENTOS DEL DOM
// ===============================
const questionText = document.getElementById("questionText");
const answersContainer = document.getElementById("answersContainer");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const quizWrapper = document.getElementById("quizWrapper");

const nextPlayerBtn = document.getElementById("nextPlayerBtn");
const assignmentsList = document.getElementById("assignmentsList");

// Estilos por defecto del cuadro
const DEFAULT_BG = "rgba(20, 0, 40, 0.55)";
const DEFAULT_SHADOW = "0 18px 40px rgba(0, 0, 0, 0.7)";
const DEFAULT_PROGRESS_BG = "linear-gradient(90deg, #d18aff, #9a3dff, #5a00ff)";

// ===============================
// MÚSICA
// ===============================
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

function initMusic() {
    bgMusic.volume = 0.15;

    const startMusicOnce = () => {
        bgMusic.play().catch(() => {});
        document.removeEventListener("click", startMusicOnce);
    };
    document.addEventListener("click", startMusicOnce);

    musicToggle.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(() => {});
            musicToggle.textContent = "🎵 Música: ON";
        } else {
            bgMusic.pause();
            musicToggle.textContent = "🎵 Música: OFF";
        }
    });
}

// ===============================
// ANIMACIÓN DE FADE
// ===============================
function applyFadeAnimation() {
    questionText.classList.remove("fade-in");
    answersContainer.classList.remove("fade-in");
    void questionText.offsetWidth;
    questionText.classList.add("fade-in");
    answersContainer.classList.add("fade-in");
}

// ===============================
// BARRA DE PROGRESO
// ===============================
function updateProgressBar() {
    const total = questions.length;
    const percent = (currentIndex / total) * 100;
    progressFill.style.width = percent + "%";
}

// ===============================
// TEMA SEGÚN EQUIPO
// ===============================
function applyTeamTheme(team) {
    quizWrapper.style.background = "rgba(5, 5, 10, 0.9)";
    quizWrapper.style.boxShadow = `0 0 40px ${team.color}`;
    progressFill.style.background = `linear-gradient(90deg, ${team.color}, #ffffff)`;
}

// reset del cuadro para siguiente persona
function resetTheme() {
    quizWrapper.style.background = DEFAULT_BG;
    quizWrapper.style.boxShadow = DEFAULT_SHADOW;
    progressFill.style.background = DEFAULT_PROGRESS_BG;
}

// ===============================
// CONFETI FINAL & MINI CONFETI
// ===============================
function getConfettiColors(teamColor) {
    if (teamColor === "#000000") {
        return ["#e0e0e0", "#bdbdbd", "#ffffff", "#f5f5f5"];
    }
    if (teamColor === "#ffffff") {
        return ["#ffffff", "#ffe082", "#80d8ff", "#ff80ab"];
    }
    return [teamColor, teamColor, "#ffffff", "#ffe082"];
}

function miniConfetti(teamColor) {
    const colors = getConfettiColors(teamColor);
    const numPieces = 5;

    for (let i = 0; i < numPieces; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "vw";
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const duration = 1 + Math.random() * 0.8;
        const delay = Math.random() * 0.2;
        piece.style.animationDuration = duration + "s";
        piece.style.animationDelay = delay + "s";

        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), (duration + delay) * 1000);
    }
}

function launchConfetti(teamColor) {
    const colors = getConfettiColors(teamColor);
    const numPieces = 120;

    for (let i = 0; i < numPieces; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "vw";
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const duration = 2.5 + Math.random() * 1.5;
        const delay = Math.random() * 0.5;
        piece.style.animationDuration = duration + "s";
        piece.style.animationDelay = delay + "s";

        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), (duration + delay) * 1000);
    }
}

// ===============================
// LISTA INFERIOR (ASIGNACIONES)
// ===============================
function updateAssignmentsUI() {
    if (assignedTeams.length === 0) {
        assignmentsList.textContent = "";
        return;
    }

    assignmentsList.innerHTML = assignedTeams
        .map((a) => {
            if (a.color === "#000000") {
                return `<div>Equipo ${a.run}: <span style="color:#e0e0e0; text-shadow:0 0 6px #d9d9d9, 0 0 10px #ffffff;">${a.name}</span></div>`;
            }
            return `<div>Equipo ${a.run}: <span style="color:${a.color}; text-shadow:0 0 6px ${a.color};">${a.name}</span></div>`;
        })
        .join("");
}

// ===============================
// PANTALLA FINAL WONSLIMPIADAS
// ===============================
function showFinalScreen() {
    questionText.textContent = "¡Prepárense para las Wonslimpiadas 2!";
    progressText.textContent = "Equipos, nos vemos pronto 🔥";
    progressFill.style.width = "100%";

    answersContainer.classList.remove("roulette-mode");
    answersContainer.innerHTML = "";

    const msg = document.createElement("div");
    msg.className = "final-message";
    msg.textContent = "Estos son los equipos que van a las Wonslimpiadas:";

    const listWrapper = document.createElement("div");
    listWrapper.className = "final-teams";

    assignedTeams.forEach((a) => {
        const item = document.createElement("div");
        item.className = "final-team-item";

        const label = document.createElement("span");
        label.textContent = `Equipo ${a.run}: `;

        const nameSpan = document.createElement("span");
        if (a.color === "#000000") {
            nameSpan.style.color = "#e0e0e0";
            nameSpan.style.textShadow =
                "0 0 6px #d9d9d9, 0 0 10px #ffffff";
        } else {
            nameSpan.style.color = a.color;
            nameSpan.style.textShadow = `0 0 6px ${a.color}`;
        }
        nameSpan.textContent = a.name;

        item.appendChild(label);
        item.appendChild(nameSpan);
        listWrapper.appendChild(item);
    });

    answersContainer.appendChild(msg);
    answersContainer.appendChild(listWrapper);

    nextPlayerBtn.style.display = "none";
    assignmentsList.style.display = "none";

    applyFadeAnimation();
}

// ===============================
// PANTALLA DE BIENVENIDA
// ===============================
function showIntro() {
    // texto de bienvenida (puedes cambiarlo aquí)
    questionText.textContent =
        "Bienvenidos a la elección de los nombres de sus equipos.";

    answersContainer.classList.remove("roulette-mode");
    answersContainer.innerHTML = "";

    const introText = document.createElement("div");
    introText.style.fontSize = "0.98rem";
    introText.style.marginTop = "4px";
    introText.style.opacity = "0.95";
    introText.innerText =
        "Según lo que respondan en la encuesta, se les asignará un nombre y un color oficial para su equipo. " +
        "Líder, responde sabiamente: tus respuestas serán analizadas para definir la identidad de tu equipo.";

    const startBtn = document.createElement("button");
    startBtn.className = "start-btn";
    startBtn.textContent = "Iniciar encuesta";

    startBtn.addEventListener("click", () => {
        // arrancar la primera persona
        currentIndex = 0;
        progressFill.style.width = "0%";
        progressText.textContent = "Pregunta 1 de " + questions.length;
        renderQuestion();
    });

    answersContainer.appendChild(introText);
    answersContainer.appendChild(startBtn);

    applyFadeAnimation();
}

// ===============================
// RENDERIZAR PREGUNTA
// ===============================
function renderQuestion() {
    if (runCount >= 7) {
        showFinalScreen();
        return;
    }

    if (currentIndex >= questions.length) {
        spinRoulette();
        return;
    }

    answersContainer.classList.remove("roulette-mode");

    const q = questions[currentIndex];
    questionText.textContent = q.text;
    answersContainer.innerHTML = "";

    q.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = option;

        btn.addEventListener("click", () => {
            answers[q.name] = option;
            currentIndex++;
            renderQuestion();
        });

        answersContainer.appendChild(btn);
    });

    progressText.textContent = `Pregunta ${currentIndex + 1} de ${questions.length}`;
    updateProgressBar();
    applyFadeAnimation();
}

// ===============================
// RULETA FINAL
// ===============================
function spinRoulette() {
    const availableTeams = teams.filter(
        (t) => !assignedTeams.some((a) => a.name === t.name)
    );

    progressFill.style.width = "100%";
    progressText.textContent = "Calculando tu destino... 🧠";

    questionText.textContent = "Felicidades, por lo que escogiste perteneces a:";

    answersContainer.innerHTML = "";
    answersContainer.classList.add("fade-in", "roulette-mode");

    const box = document.createElement("div");
    box.className = "roulette-box";

    const label = document.createElement("div");
    label.className = "roulette-label";
    label.textContent = "Girando la ruleta de equipos...";

    const text = document.createElement("div");
    text.className = "roulette-text";

    box.appendChild(label);
    box.appendChild(text);
    answersContainer.appendChild(box);

    let index = 0;
    let spins = 0;
    const totalSpins = 22 + Math.floor(Math.random() * 10);

    const interval = setInterval(() => {
        const currentTeam = availableTeams[index % availableTeams.length];

        miniConfetti(currentTeam.color);

        if (currentTeam.color === "#000000") {
            text.textContent = currentTeam.name;
            text.style.color = "#e0e0e0";
            text.style.textShadow = "0 0 10px #bfbfbf, 0 0 16px #ffffff";
        } else {
            text.textContent = currentTeam.name;
            text.style.color = currentTeam.color;
            text.style.textShadow = `0 0 12px ${currentTeam.color}`;
        }

        index++;
        spins++;

        if (spins >= totalSpins) {
            clearInterval(interval);

            const finalTeam = availableTeams[(index - 1) % availableTeams.length];

            if (finalTeam.color === "#000000") {
                text.textContent = finalTeam.name;
                text.style.color = "#e0e0e0";
                text.style.textShadow =
                    "0 0 12px #d9d9d9, 0 0 22px #ffffff, 0 0 30px #cfcfcf";
            } else {
                text.textContent = finalTeam.name;
                text.style.color = finalTeam.color;
                text.style.textShadow = `0 0 18px ${finalTeam.color}`;
            }

            runCount++;
            assignedTeams.push({
                run: runCount,
                name: finalTeam.name,
                color: finalTeam.color
            });

            updateAssignmentsUI();
            applyTeamTheme(finalTeam);
            launchConfetti(finalTeam.color);

            if (runCount < 7) {
                nextPlayerBtn.style.display = "inline-block";
            } else {
                nextPlayerBtn.style.display = "none";
                setTimeout(showFinalScreen, 1500);
            }
        }
    }, 120);
}

// ===============================
// SIGUIENTE PERSONA
// ===============================
function startNextPlayer() {
    if (runCount >= 7) {
        showFinalScreen();
        return;
    }

    currentIndex = 0;
    for (const k in answers) delete answers[k];

    progressFill.style.width = "0%";
    progressText.textContent = "Nueva persona, nueva suerte 🍀";
    resetTheme();

    nextPlayerBtn.style.display = "none";
    renderQuestion();
}

// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    initMusic();
    showIntro();                 // ⬅️ ahora partimos con la pantalla de bienvenida
    nextPlayerBtn.addEventListener("click", startNextPlayer);
});
