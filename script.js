// ====== VARIABILI GLOBALI ======
let todayBreaks = JSON.parse(localStorage.getItem("todayBreaks") || "[]");
const today = new Date().toISOString().split("T")[0];
todayBreaks = todayBreaks.filter(b => b.date === today);
localStorage.setItem("todayBreaks", JSON.stringify(todayBreaks));
updateBreakList();
let isLooping = false;
let currentTimer = null;

// ====== AGGIORNA L'ORA CORRENTE ======
function updateCurrentTime() {
    const now = new Date();
    const currentTimeEl = document.getElementById("current-time");
    if (currentTimeEl) currentTimeEl.textContent = now.toLocaleTimeString();
}
setInterval(updateCurrentTime, 1000);
window.onload = () => {
    updateCurrentTime();
    loadProjectCode();
};

// ====== TIMER COUNTDOWN ======
function startCountdown(duration) {
    const countdownEl = document.getElementById("countdown");
    let timer = duration / 1000;
    countdownEl.textContent = formatTime(timer);
    clearInterval(currentTimer);
    currentTimer = setInterval(() => {
        timer--;
        if (timer <= 0) {
            clearInterval(currentTimer);
            countdownEl.textContent = "Fine pausa!";
            playAudio('end');
            isLooping = false;
            document.querySelector('.loop-icon')?.classList.remove('active');
        } else {
            countdownEl.textContent = formatTime(timer);
            // Logica loop (4-7 minuti rimanenti)
            if (isLooping && timer >= 240 && timer <= 420) {
                clearInterval(currentTimer);
                playAudio('start');
                const now = new Date();
                const newDuration = 15 * 60 * 1000;
                const endTime = new Date(now.getTime() + newDuration);
                const startTimeEl = document.getElementById("start-time");
                const endTimeEl = document.getElementById("end-time");
                if (startTimeEl) startTimeEl.textContent = now.toLocaleTimeString();
                if (endTimeEl) endTimeEl.textContent = endTime.toLocaleTimeString();
                startCountdown(newDuration);
            }
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ====== GESTIONE PAUSA ======
function startBreak() {
    const now = new Date();
    const duration = 15 * 60 * 1000;
    const endTime = new Date(now.getTime() + duration);
    const startTimeEl = document.getElementById("start-time");
    const endTimeEl = document.getElementById("end-time");
    if (startTimeEl) startTimeEl.textContent = now.toLocaleTimeString();
    if (endTimeEl) endTimeEl.textContent = endTime.toLocaleTimeString();
    playAudio('start');
    startCountdown(duration);
    const projectCode = localStorage.getItem("projectCode") || "Nessun codice";
    todayBreaks.push({ 
        date: today, 
        time: now.toLocaleTimeString(), 
        code: projectCode 
    });
    localStorage.setItem("todayBreaks", JSON.stringify(todayBreaks));
    updateBreakList();
}

// ====== NOTIFICHE AUDIO ======
function playAudio(type) {
    try {
        const sound = document.getElementById(`${type}Sound`);
        if (sound) {
            sound.volume = 0.2;
            sound.currentTime = 0;
            sound.play();
        }
    } catch (error) {
        console.warn(`Errore riproduzione audio "${type}":`, error);
    }
}

// ====== LISTA DELLE PAUSE ======
function updateBreakList() {
    const list = document.getElementById("breaks-list");
    if (list) {
        list.innerHTML = "";
        todayBreaks.forEach(b => {
            const li = document.createElement("li");
            li.textContent = `Pausa alle ${b.time} - Codice: ${b.code}`;
            list.appendChild(li);
        });
    }
}

// ====== MODIFICA CODICE PROGETTO ======
function saveProjectCode() {
    const code = document.getElementById("project-code").value.trim();
    if (code) {
        localStorage.setItem("projectCode", code);
        document.getElementById("display-project-code").textContent = `Codice: ${code}`;
        document.querySelector(".input-group").style.display = "none";
        updateEditButtonVisibility();
    } else {
        alert("Per favore, inserisci un codice progetto.");
    }
}

function loadProjectCode() {
    const savedCode = localStorage.getItem("projectCode");
    if (savedCode) {
        document.getElementById("project-code").value = savedCode;
        document.getElementById("display-project-code").textContent = `Codice: ${savedCode}`;
        document.querySelector(".input-group").style.display = "none";
        updateEditButtonVisibility();
    }
}

function showEditCode() {
    document.querySelector(".input-group").style.display = "flex";
    document.getElementById("edit-code-btn").style.display = "none";
}

function updateEditButtonVisibility() {
    const code = localStorage.getItem("projectCode") || "";
    const editBtn = document.getElementById("edit-code-btn");
    if (code) {
        editBtn.style.display = "inline-block";
    } else {
        editBtn.style.display = "none";
    }
}

// ====== LOOP FUNCTIONALITY ======
function toggleLoop() {
    isLooping = !isLooping;
    const icon = document.querySelector('.loop-icon');
    if (icon) {
        icon.classList.toggle('active', isLooping);
    }
}
