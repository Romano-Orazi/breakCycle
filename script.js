// ====== MODULO GESTIONE DATI ======
const STORAGE_KEYS = {
    BREAKS: "todayBreaks",
    PROJECT_CODE: "projectCode"
};

class BreakManager {
    constructor() {
        this.today = new Date().toISOString().split("T")[0];
        this.todayBreaks = this.loadBreaks();
    }

    loadBreaks() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.BREAKS);
            return stored ? JSON.parse(stored).filter(b => b.date === this.today) : [];
        } catch (error) {
            console.error("Errore nel caricamento delle pause:", error);
            return [];
        }
    }

    saveBreaks() {
        localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(this.todayBreaks));
    }

    addBreak(time, code) {
        this.todayBreaks.push({ 
            date: this.today, 
            time, 
            code: code || "Nessun codice"
        });
        this.saveBreaks();
        updateBreakList(this.todayBreaks);
    }
}

// ====== MODULO UI ======
const UI = {
    elements: {
        currentDate: document.getElementById("current-date"),
        currentTime: document.getElementById("current-time"),
        startTime: document.getElementById("start-time"),
        endTime: document.getElementById("end-time"),
        countdown: document.getElementById("countdown"),
        projectCodeInput: document.getElementById("project-code"),
        displayProjectCode: document.getElementById("display-project-code"),
        breaksList: document.getElementById("breaks-list"),
        saveCodeBtn: document.getElementById("save-code-btn"),
        startBreakBtn: document.getElementById("start-break-btn")
    },

    updateClock() {
        const now = new Date();
        this.elements.currentTime.textContent = now.toLocaleTimeString();
    },

    updateCountdown(timer) {
        const mins = String(Math.floor(timer / 60)).padStart(2, '0');
        const secs = String(timer % 60).padStart(2, '0');
        this.elements.countdown.textContent = `${mins}:${secs}`;
    }
};

// ====== INIZIALIZZAZIONE ======
const breakManager = new BreakManager();

document.addEventListener('DOMContentLoaded', () => {
    UI.updateClock();
    UI.elements.currentDate.textContent = `(${new Date().toLocaleDateString('it-IT')})`;
    
    if (localStorage.getItem(STORAGE_KEYS.PROJECT_CODE)) {
        UI.elements.displayProjectCode.textContent = localStorage.getItem(STORAGE_KEYS.PROJECT_CODE);
        UI.elements.projectCodeInput.value = localStorage.getItem(STORAGE_KEYS.PROJECT_CODE);
    }
    
    updateBreakList(breakManager.todayBreaks);
    setInterval(UI.updateClock, 1000);
});

// ====== EVENT LISTENERS ======
UI.elements.saveCodeBtn.addEventListener('click', () => {
    const code = UI.elements.projectCodeInput.value.trim();
    if (!code) {
        alert("Inserisci un codice progetto valido.");
        return;
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECT_CODE, code);
    UI.elements.displayProjectCode.textContent = code;
});

UI.elements.startBreakBtn.addEventListener('click', () => {
    const now = new Date();
    const duration = 15 * 60 * 1000; // 15 minuti
    const endTime = new Date(now.getTime() + duration);
    
    UI.elements.startTime.textContent = now.toLocaleTimeString();
    UI.elements.endTime.textContent = endTime.toLocaleTimeString();
    
    playAudio('start');
    startCountdown(duration, () => playAudio('end'));
    
    const projectCode = localStorage.getItem(STORAGE_KEYS.PROJECT_CODE) || "Nessun codice";
    breakManager.addBreak(now.toLocaleTimeString(), projectCode);
});

// ====== FUNZIONI AUSILIARIE ======
function startCountdown(duration, onComplete) {
    let timer = Math.floor(duration / 1000);
    UI.updateCountdown(timer);
    
    const interval = setInterval(() => {
        if (timer <= 0) {
            clearInterval(interval);
            UI.elements.countdown.textContent = "Fine pausa!";
            if (onComplete) onComplete();
            return;
        }
        timer--;
        UI.updateCountdown(timer);
    }, 1000);
}

function playAudio(type) {
    try {
        const sound = document.getElementById(`${type}Sound`);
        sound.volume = 0.2;
        sound.currentTime = 0;
        sound.play();
    } catch (error) {
        console.error(`Errore riproduzione audio ${type}:`, error);
    }
}

function updateBreakList(breaks) {
    UI.elements.breaksList.innerHTML = "";
    breaks.forEach(b => {
        const li = document.createElement("li");
        li.textContent = `Pausa alle ${b.time} - Codice: ${b.code}`;
        UI.elements.breaksList.appendChild(li);
    });
}