/**
 * Tacura (TactOS) Interactive Showcase Script
 * Handles real-time 6-dot Braille cell simulation, speech synthesis, and hardware controls.
 */

// ── Standard 6-Dot Braille Map (Matches Python braille_map.py & Arduino C++) ──
const BRAILLE_MAP = {
    'A': [1,0,0,0,0,0], 'B': [1,1,0,0,0,0], 'C': [1,0,0,1,0,0], 'D': [1,0,0,1,1,0],
    'E': [1,0,0,0,1,0], 'F': [1,1,0,1,0,0], 'G': [1,1,0,1,1,0], 'H': [1,1,0,0,1,0],
    'I': [0,1,0,1,0,0], 'J': [0,1,0,1,1,0], 'K': [1,0,1,0,0,0], 'L': [1,1,1,0,0,0],
    'M': [1,0,1,1,0,0], 'N': [1,0,1,1,1,0], 'O': [1,0,1,0,1,0], 'P': [1,1,1,1,0,0],
    'Q': [1,1,1,1,1,0], 'R': [1,1,1,0,1,0], 'S': [0,1,1,1,0,0], 'T': [0,1,1,1,1,0],
    'U': [1,0,1,0,0,1], 'V': [1,1,1,0,0,1], 'W': [0,1,0,1,1,1], 'X': [1,0,1,1,0,1],
    'Y': [1,0,1,1,1,1], 'Z': [1,0,1,0,1,1]
};

document.addEventListener('DOMContentLoaded', () => {
    const alphabetGrid = document.getElementById('alphabet-buttons');
    const currentCharEl = document.getElementById('current-char');
    const currentBitsEl = document.getElementById('current-bits');
    const btnSpeak = document.getElementById('btn-speak');
    const btnClear = document.getElementById('btn-clear');
    const btnTest = document.getElementById('btn-test');

    let activeLetter = 'A';

    // Render A-Z Buttons
    Object.keys(BRAILLE_MAP).forEach(char => {
        const btn = document.createElement('button');
        btn.className = `btn-char ${char === 'A' ? 'selected' : ''}`;
        btn.textContent = char;
        btn.dataset.char = char;
        btn.addEventListener('click', () => selectLetter(char));
        alphabetGrid.appendChild(btn);
    });

    // Select & Update Braille Cell
    function selectLetter(char) {
        activeLetter = char.toUpperCase();
        const pattern = BRAILLE_MAP[activeLetter] || [0,0,0,0,0,0];

        // Update UI Text
        currentCharEl.textContent = activeLetter;
        currentBitsEl.textContent = pattern.join('');

        // Update Active Button Style
        document.querySelectorAll('.btn-char').forEach(b => {
            b.classList.toggle('selected', b.dataset.char === activeLetter);
        });

        // Update 6 Braille Dots Visualizer
        for (let i = 1; i <= 6; i++) {
            const dotEl = document.getElementById(`dot-${i}`);
            if (dotEl) {
                const isActive = pattern[i - 1] === 1;
                dotEl.classList.toggle('active', isActive);
            }
        }
    }

    // Speech Synthesis (Web Speech API)
    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Event Listeners
    btnSpeak.addEventListener('click', () => {
        speakText(`Letter ${activeLetter}`);
    });

    btnClear.addEventListener('click', () => {
        currentCharEl.textContent = '-';
        currentBitsEl.textContent = '000000';
        document.querySelectorAll('.btn-char').forEach(b => b.classList.remove('selected'));
        for (let i = 1; i <= 6; i++) {
            const dotEl = document.getElementById(`dot-${i}`);
            if (dotEl) dotEl.classList.remove('active');
        }
        speakText('Display Cleared');
    });

    btnTest.addEventListener('click', async () => {
        speakText('Running Hardware Self Test');
        // Cycle all dots ON then OFF
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`dot-${i}`).classList.add('active');
            await new Promise(r => setTimeout(r, 150));
        }
        await new Promise(r => setTimeout(r, 600));
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`dot-${i}`).classList.remove('active');
            await new Promise(r => setTimeout(r, 100));
        }
        selectLetter(activeLetter);
    });

    // Keyboard Press Handler (Type any A-Z key)
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (BRAILLE_MAP[key]) {
            selectLetter(key);
            speakText(key);
        }
    });

    // Initial load
    selectLetter('A');
});
