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
        
    },
    {
        text: "8. ¿Si le pudieras pedir un deseo a nashito?, ¿Cuál sería?",
        name: "p8",
        options: [
            "Que me suba el pase del Fortnite",
            "Que me regale una PS5",
            "Que pida un saludo de Don Cambiaso",
            "Que me regale un Wonsito"
        ]
        
    },
    {
    text: "9. ¿Qué animal te representa?",
    name: "p9",
    options: ["Perro", "Gato", "Águila", "Serpiente"]
    },
    {
    text: "10. ¿Qué superpoder te gustaría tener?",
    name: "p10",
    options: ["Volar", "Superfuerza", "Telepatía", "Invisibilidad"]
    },
    {
    text: "11. ¿Si fueras un Pokémon, qué tipo serías?",
    name: "p11",
    options: ["Agua", "Fuego", "Siniestro", "Chileno"]
    },
    {
    text: "12. ¿Qué anime verías mil veces?",
    name: "p12",
    options: ["Naruto", "One Piece", "Dragon Ball", "Boku no Pico (valentía)"]
    },
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

// Videos específicos por equipo
const fallbackTeamVideo = "static/videos/pinterest-video.mp4";
const teamVideos = {
    "Apóstoles de Nashito": "static/videos/equipos/Apostoles_de_Nashito.mp4",
    "Los Loleros": "static/videos/equipos/Loleros_fc.mp4",
    "Callampa FC": "static/videos/equipos/Callampa_FC.mp4",
    "Deportes Chuchunco City": "static/videos/equipos/Chuchunco_city.mp4",
    "Enanito FC": "static/videos/equipos/Enano_FC.mp4",
    "Orgullo CDF": "static/videos/equipos/Orgullo_CDF.mp4",
    "Wons United": "static/videos/equipos/Wons_United.mp4"
};

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
const teamVideoOverlay = document.getElementById("teamVideoOverlay");
const teamVideo = document.getElementById("teamVideo");
const teamVideoTitle = document.getElementById("teamVideoTitle");
const skipVideoBtn = document.getElementById("skipVideoBtn");
const musicPlayPauseBtn = document.getElementById("musicPlayPauseBtn");
const musicNextBtn = document.getElementById("musicNextBtn");
const musicPrevBtn = document.getElementById("musicPrevBtn");
const musicVolumeSlider = document.getElementById("musicVolume");
let awaitingVideoCompletion = false;
let pendingTeam = null;

// Estilos por defecto del cuadro
const DEFAULT_BG = "rgba(20, 0, 40, 0.55)";
const DEFAULT_SHADOW = "0 18px 40px rgba(0, 0, 0, 0.7)";
const DEFAULT_PROGRESS_BG = "linear-gradient(90deg, #d18aff, #9a3dff, #5a00ff)";

// ===============================
// MÚSICA
// ===============================
const bgMusic = document.getElementById("bgMusic");
const DEFAULT_VOLUME = 0.15;
const musicPlaylist = [
    {
        title: "ATEEZ - HALAZIA (Instrumental)",
        src: "static/audio/ATEEZ - HALAZIA  Instrumental - WONNIE THE WORLD.mp3"
    }
];
let currentTrackIndex = 0;

function getCurrentTrack() {
    if (!musicPlaylist.length) return null;
    return musicPlaylist[currentTrackIndex];
}

function updateMusicButtonState() {
    if (!musicPlayPauseBtn) return;
    if (!bgMusic || bgMusic.paused) {
        musicPlayPauseBtn.textContent = "▶";
    } else {
        musicPlayPauseBtn.textContent = "❚❚";
    }
}

function loadCurrentTrack(autoplay = false) {
    if (!bgMusic) return;
    const track = getCurrentTrack();
    if (!track) return;
    if (bgMusic.getAttribute("src") !== track.src) {
        bgMusic.setAttribute("src", track.src);
    }
    bgMusic.load();
    if (autoplay) {
        playCurrentTrack();
    } else {
        updateMusicButtonState();
    }
}

function playCurrentTrack() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
        updateMusicButtonState();
    }).catch(() => {});
}

function pauseCurrentTrack() {
    if (!bgMusic) return;
    bgMusic.pause();
    updateMusicButtonState();
}

function changeTrack(direction, forceAutoplay = false) {
    if (!musicPlaylist.length) return;
    currentTrackIndex =
        (currentTrackIndex + direction + musicPlaylist.length) %
        musicPlaylist.length;
    const shouldAutoplay = forceAutoplay || (bgMusic && !bgMusic.paused);
    loadCurrentTrack(shouldAutoplay);
}

function initMusic() {
    if (!bgMusic) return;
    bgMusic.volume = DEFAULT_VOLUME;
    loadCurrentTrack(false);
    if (musicVolumeSlider) {
        musicVolumeSlider.value = Math.round(bgMusic.volume * 100);
    }

    const startMusicOnce = () => {
        document.removeEventListener("click", startMusicOnce);
        if (bgMusic.paused) {
            playCurrentTrack();
        }
    };
    document.addEventListener("click", startMusicOnce);

    if (musicPlayPauseBtn) {
        musicPlayPauseBtn.addEventListener("click", () => {
            if (bgMusic.paused) {
                playCurrentTrack();
            } else {
                pauseCurrentTrack();
            }
        });
    }

    if (musicNextBtn) {
        musicNextBtn.addEventListener("click", () => changeTrack(1));
    }
    if (musicPrevBtn) {
        musicPrevBtn.addEventListener("click", () => changeTrack(-1));
    }

    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener("input", (event) => {
            if (!bgMusic) return;
            const value = Number(event.target.value);
            const normalized = Math.min(100, Math.max(0, value)) / 100;
            bgMusic.volume = normalized;
        });
    }

    bgMusic.addEventListener("ended", () => changeTrack(1, true));
    bgMusic.addEventListener("play", () => {
        updateMusicButtonState();
    });
    bgMusic.addEventListener("pause", () => {
        updateMusicButtonState();
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
// TRANSICIÓN CON VIDEO DE EQUIPO
// ===============================
function showTeamVideoTransition(team) {
    if (!team) {
        finalizeTeamAssignment();
        return;
    }

    const videoSrc = teamVideos[team.name] || fallbackTeamVideo;

    if (!teamVideo || !teamVideoOverlay) {
        finalizeTeamAssignment();
        return;
    }

    if (teamVideoTitle) {
        teamVideoTitle.textContent = team.name;
        const titleColor = team.color === "#000000" ? "#f5f5f5" : team.color;
        teamVideoTitle.style.color = titleColor;
        teamVideoTitle.style.textShadow =
            team.color === "#000000"
                ? "0 0 12px rgba(255,255,255,0.85)"
                : `0 0 12px ${team.color}`;
    }

    if (teamVideo.getAttribute("src") !== videoSrc) {
        teamVideo.setAttribute("src", videoSrc);
    }
    teamVideo.load();

    awaitingVideoCompletion = true;
    teamVideoOverlay.classList.add("visible");
    teamVideo.currentTime = 0;

    const playPromise = teamVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
            onTeamVideoFinished();
        });
    }
}

function hideTeamVideoOverlay() {
    if (teamVideo) {
        teamVideo.pause();
        teamVideo.currentTime = 0;
    }
    if (teamVideoOverlay) {
        teamVideoOverlay.classList.remove("visible");
    }
    if (teamVideoTitle) {
        teamVideoTitle.textContent = "";
    }
}

function onTeamVideoFinished() {
    if (!awaitingVideoCompletion) return;
    awaitingVideoCompletion = false;
    hideTeamVideoOverlay();
    finalizeTeamAssignment();
}

// ===============================
// ASIGNACIÓN Y FINALIZACIÓN
// ===============================
function selectTeamForCurrentRun() {
    const availableTeams = teams.filter(
        (t) => !assignedTeams.some((a) => a.name === t.name)
    );
    if (availableTeams.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableTeams.length);
    return availableTeams[randomIndex];
}

function startTeamVideoSequence() {
    pendingTeam = selectTeamForCurrentRun();

    progressFill.style.width = "100%";
    progressText.textContent = "Reproduciendo la presentación del equipo...";
    questionText.textContent = "¡Descubre a tu equipo en el video!";
    answersContainer.innerHTML = "";
    answersContainer.classList.remove("roulette-mode");
    applyFadeAnimation();

    if (!pendingTeam) {
        finalizeTeamAssignment();
        return;
    }

    showTeamVideoTransition(pendingTeam);
}

function finalizeTeamAssignment() {
    if (!pendingTeam) {
        if (runCount >= 7) {
            showFinalScreen();
        }
        return;
    }

    const finalTeam = pendingTeam;
    pendingTeam = null;

    runCount++;
    assignedTeams.push({
        run: runCount,
        name: finalTeam.name,
        color: finalTeam.color
    });

    updateAssignmentsUI();
    applyTeamTheme(finalTeam);
    launchConfetti(finalTeam.color);

    answersContainer.innerHTML = "";
    questionText.textContent = "Presentación completada.";
    progressText.textContent =
        runCount < 7
            ? 'Presiona "Siguiente equipo" para continuar.'
            : "Todos los equipos ya tienen presentación.";
    applyFadeAnimation();

    if (runCount < 7) {
        nextPlayerBtn.style.display = "inline-block";
    } else {
        nextPlayerBtn.style.display = "none";
        setTimeout(showFinalScreen, 1500);
    }
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
    introText.className = "intro-text";
    introText.innerText =
        "Según lo que respondas, se les asignará un Equipo oficial a ti y a tu compañero. " +
        "Líder, debes responder sabiamente, tus respuestas serán analizadas para definir la identidad de tu equipo.";

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
        startTeamVideoSequence();
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
// SIGUIENTE PERSONA
// ===============================
function startNextPlayer() {
    if (runCount >= 7) {
        showFinalScreen();
        return;
    }

    pendingTeam = null;
    awaitingVideoCompletion = false;
    hideTeamVideoOverlay();

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
    if (skipVideoBtn) {
        skipVideoBtn.addEventListener("click", () => {
            onTeamVideoFinished();
        });
    }
    if (teamVideo) {
        teamVideo.addEventListener("ended", () => {
            onTeamVideoFinished();
        });
    }
});
