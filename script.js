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
    document.getElementById("current-time").textContent = now.toLocaleTimeString();
}
setInterval(updateCurrentTime, 1000);

window.onload = () => {
    updateCurrentTime();
    loadProjectCode(); // Carica il codice progetto
};

// ====== TIMER COUNTDOWN ======
function startCountdown(duration) {
    const countdownEl = document.getElementById("countdown");
    let timer = duration / 1000;
    countdownEl.textContent = formatTime(timer);

    clearInterval(currentTimer); // Pulisce eventuali timer attivi
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
                clearInterval(currentTimer); // Ferma il timer corrente
                playAudio('start'); // Riproduce suono iniziale
                
                // Aggiorna l'orario di inizio e fine pausa
                const now = new Date();
                const newDuration = 15 * 60 * 1000; // 15 minuti
                const endTime = new Date(now.getTime() + newDuration);
                
                // Aggiorna gli elementi DOM
                const startTimeEl = document.getElementById("start-time");
                const endTimeEl = document.getElementById("end-time");
                
                if (startTimeEl) startTimeEl.textContent = now.toLocaleTimeString();
                if (endTimeEl) endTimeEl.textContent = endTime.toLocaleTimeString();
                
                // Ricomincia il countdown da 15 minuti
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
    const duration = 15 * 60 * 1000; // 15 minuti
    const endTime = new Date(now.getTime() + duration);

    // Aggiorna l'orario di inizio e fine solo se gli elementi esistono
    const startTimeEl = document.getElementById("start-time");
    const endTimeEl = document.getElementById("end-time");

    if (startTimeEl) startTimeEl.textContent = now.toLocaleTimeString();
    if (endTimeEl) endTimeEl.textContent = endTime.toLocaleTimeString();

    playAudio('start');
    startCountdown(duration);

    // Recupera il codice progetto
    const projectCode = localStorage.getItem("projectCode") || "Nessun codice";
    // Registra la pausa con il codice progetto
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
        document.getElementById("display-project-code").textContent = code;
        
        // Nascondi sezione input, mostra sezione display
        document.querySelector(".input-section").style.display = "none";
        document.querySelector(".display-section").style.display = "flex";
    } else {
        alert("Per favore, inserisci un codice progetto.");
    }
}

function loadProjectCode() {
    const savedCode = localStorage.getItem("projectCode");
    if (savedCode) {
        document.getElementById("project-code").value = savedCode;
        document.getElementById("display-project-code").textContent = savedCode;
        document.querySelector(".input-section").style.display = "none";
        document.querySelector(".display-section").style.display = "flex";
    }
}

// ====== FUNZIONE PER TOGGLARE L'EDITOR ======
function toggleEdit() {
    const inputSection = document.querySelector(".input-section");
    const displaySection = document.querySelector(".display-section");
    
    inputSection.style.display = inputSection.style.display === "none" ? "flex" : "none";
    displaySection.style.display = displaySection.style.display === "none" ? "flex" : "none";
    
    if (inputSection.style.display === "flex") {
        document.getElementById("project-code").focus();
    }
}
