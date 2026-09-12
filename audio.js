/**
 * Arcane Audio Engine - The Restricted Section
 * Procedural Web Audio API sound generator for an immersive magical atmosphere.
 * Zero external audio assets required; runs reliably in all modern browsers.
 */
(function () {
    "use strict";

    let audioCtx = null;
    let masterGain = null;
    let isMuted = localStorage.getItem("arcane_audio_muted") === "true";
    let isAmbiencePlaying = false;
    let ambienceNodes = null;
    let lastHoverTime = 0;

    // Lazy initialization of AudioContext on first user interaction
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            audioCtx = new AudioContextClass();

            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(isMuted ? 0 : 0.35, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        return audioCtx;
    }

    // Unmute or mute master volume
    function setMuted(muted) {
        isMuted = muted;
        localStorage.setItem("arcane_audio_muted", muted ? "true" : "false");

        if (masterGain && audioCtx) {
            const now = audioCtx.currentTime;
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.35, now + 0.1);
        }

        updateAudioButtonUI();
    }

    function toggleMute() {
        getAudioContext();
        setMuted(!isMuted);
        return !isMuted;
    }

    function updateAudioButtonUI() {
        const btn = document.getElementById("audioToggleBtn");
        if (!btn) return;

        const iconEl = btn.querySelector(".audio-icon");
        const textEl = btn.querySelector(".audio-text");

        if (isMuted) {
            btn.classList.add("muted");
            if (iconEl) iconEl.textContent = "🔕";
            if (textEl) textEl.textContent = "Muted";
            btn.setAttribute("title", "Unmute Arcane Sound Effects");
        } else {
            btn.classList.remove("muted");
            if (iconEl) iconEl.textContent = "🔔";
            if (textEl) textEl.textContent = "Audio: On";
            btn.setAttribute("title", "Mute Arcane Sound Effects");
        }
    }

    // =========================================================================
    // PROCEDURAL SOUND EFFECT GENERATORS
    // =========================================================================

    /**
     * Shimmering crystal bell sparkle for spells and magical entrances
     */
    function playSparkle() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;
        // Ascending harmonic frequencies (E6, G6, B6, E7)
        const freqs = [1318.5, 1567.9, 1975.5, 2637.0];

        freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = idx % 2 === 0 ? "sine" : "triangle";
            osc.frequency.setValueAtTime(freq + (Math.random() * 10 - 5), now + idx * 0.045);

            gain.gain.setValueAtTime(0, now + idx * 0.045);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.045 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.65);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + idx * 0.045);
            osc.stop(now + idx * 0.045 + 0.7);
        });
    }

    /**
     * Ancient parchment scroll unroll / flutter (shaped filtered noise)
     */
    function playParchment() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate pink-ish noise
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            data[i] = (b0 + b1 + b2) * 0.4;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 2.5;

        const now = ctx.currentTime;
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(700, now + 0.35);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
        noise.stop(now + 0.36);
    }

    /**
     * Deep heavy wooden grimoire chest / vault thud
     */
    function playVaultThud() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;

        // Sub-bass sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.4);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.46);

        // Accompanying parchment rustle
        setTimeout(() => playParchment(), 40);
    }

    /**
     * Enchanted crystal chime for 1 to 5 stars
     */
    function playStarTone(starIndex) {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;
        // C5, D5, E5, G5, A5 pentatonic scale
        const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
        const freq = scale[Math.min(Math.max(starIndex - 1, 0), 4)];

        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        oscHarmonic.type = "triangle";
        oscHarmonic.frequency.setValueAtTime(freq * 2, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + 0.75);
        oscHarmonic.stop(now + 0.75);
    }

    /**
     * Enchanted Quill scratching flourish + celebratory chord upon review inscription
     */
    function playQuillInscribe() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;

        // Quick quill scratch flourish
        playParchment();

        // Celebratory triumphant harp chime chord (C5, G5, C6)
        const chord = [523.25, 783.99, 1046.50];
        chord.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.06);

            gain.gain.setValueAtTime(0, now + 0.12 + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.11, now + 0.12 + idx * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12 + idx * 0.06 + 1.1);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + 0.12 + idx * 0.06);
            osc.stop(now + 0.12 + idx * 0.06 + 1.15);
        });
    }

    /**
     * Swirling wand spell sound for Lumos / Nox toggling
     */
    function playWandSpell() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.45);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(2400, now + 0.2);
        filter.frequency.linearRampToValueAtTime(600, now + 0.45);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.55);

        setTimeout(() => playSparkle(), 80);
    }

    /**
     * Gold wax seal imprint / stamp chime (helpful vote)
     */
    function playWaxSeal() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;

        // Stamp thud
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        gain1.gain.setValueAtTime(0.16, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc1.connect(gain1);
        gain1.connect(masterGain);

        osc1.start(now);
        osc1.stop(now + 0.22);

        // Gold coin ring
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1864, now + 0.02);

        gain2.gain.setValueAtTime(0, now + 0.02);
        gain2.gain.linearRampToValueAtTime(0.09, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc2.start(now + 0.02);
        osc2.stop(now + 0.48);
    }

    /**
     * Soft parchment click for category filters and sorting
     */
    function playFilterClick() {
        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * Subtle debounced resonance when hovering over ancient book cards
     */
    function playCardHover() {
        const nowMs = Date.now();
        if (nowMs - lastHoverTime < 240) return; // Debounce
        lastHoverTime = nowMs;

        const ctx = getAudioContext();
        if (!ctx || isMuted) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(392, now); // G4 soft warm harmonic
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.022, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // =========================================================================
    // EVENT BINDINGS FOR SEAMLESS EXPERIENCE
    // =========================================================================
    function initEventBindings() {
        // Resume AudioContext on first touch/click anywhere
        const enableAudioOnInteraction = () => {
            getAudioContext();
            document.removeEventListener("click", enableAudioOnInteraction);
            document.removeEventListener("keydown", enableAudioOnInteraction);
            document.removeEventListener("touchstart", enableAudioOnInteraction);
        };
        document.addEventListener("click", enableAudioOnInteraction, { once: true });
        document.addEventListener("keydown", enableAudioOnInteraction, { once: true });
        document.addEventListener("touchstart", enableAudioOnInteraction, { once: true });

        // Navbar Audio Toggle Button
        const audioBtn = document.getElementById("audioToggleBtn");
        if (audioBtn) {
            updateAudioButtonUI();
            audioBtn.addEventListener("click", () => {
                const nowActive = toggleMute();
                if (nowActive) {
                    playSparkle();
                    if (window.showToast) {
                        window.showToast("🔔 Arcane sound effects awakened!");
                    }
                } else {
                    if (window.showToast) {
                        window.showToast("🔕 Arcane library silenced into quiet study.");
                    }
                }
            });
        }

        // Lumos / Nox Wand Spell
        const lumosBtn = document.getElementById("lumosBtn");
        if (lumosBtn) {
            lumosBtn.addEventListener("click", () => {
                playWandSpell();
            });
        }

        // Hero CTA buttons
        const heroExploreBtn = document.getElementById("heroExploreBtn");
        const heroReviewsBtn = document.getElementById("heroReviewsBtn");
        if (heroExploreBtn) {
            heroExploreBtn.addEventListener("click", () => playSparkle());
        }
        if (heroReviewsBtn) {
            heroReviewsBtn.addEventListener("click", () => playParchment());
        }

        // Inspect Stacks / Hide Stacks
        document.querySelectorAll(".view-books-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                playVaultThud();
            });
        });

        // Series Lore & Book Excerpt Lore Buttons
        document.addEventListener("click", (e) => {
            const target = e.target.closest(".preview-tome-btn, .read-book-btn");
            if (target) {
                playParchment();
                setTimeout(() => playSparkle(), 90);
            }

            // Declassify PDF
            if (e.target.closest(".read-pdf-btn")) {
                playVaultThud();
            }

            // Close modal buttons
            if (e.target.closest(".modal-close-btn, .btn-cancel, #closeBookModalBtn")) {
                playParchment();
            }

            // Filter pills
            if (e.target.closest(".filter-pill")) {
                playFilterClick();
            }

            // Helpful buttons
            if (e.target.closest(".helpful-btn")) {
                playWaxSeal();
            }
        });

        // Sort Select
        const sortSelect = document.getElementById("sortSelect");
        if (sortSelect) {
            sortSelect.addEventListener("change", () => playFilterClick());
        }

        // Review Form Stars Interaction
        const starItems = document.querySelectorAll(".star-rating-select .star-item");
        starItems.forEach((star) => {
            star.addEventListener("mouseenter", () => {
                const val = parseInt(star.getAttribute("data-val") || "5", 10);
                playStarTone(val);
            });
            star.addEventListener("click", () => {
                const val = parseInt(star.getAttribute("data-val") || "5", 10);
                playStarTone(val);
            });
        });

        // Review Form Submit Button
        const reviewForm = document.getElementById("reviewForm");
        if (reviewForm) {
            reviewForm.addEventListener("submit", () => {
                playQuillInscribe();
            });
        }

        // Card Hover Sound on Mini Books
        document.querySelectorAll(".mini-book").forEach((book) => {
            book.addEventListener("mouseenter", () => playCardHover());
        });
    }

    // Expose global interface
    window.ArcaneAudio = {
        playSparkle,
        playParchment,
        playScroll: playParchment,
        playVaultThud,
        playStarTone,
        playQuillInscribe,
        playWandSpell,
        playWaxSeal,
        playFilterClick,
        playCardHover,
        toggleMute,
        setMuted,
        isMuted: () => isMuted
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initEventBindings);
    } else {
        initEventBindings();
    }
})();
