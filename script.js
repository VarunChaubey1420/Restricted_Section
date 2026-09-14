/**
 * Arcane Archives - Hogwarts Library & Restricted Section Scribe Logic
 * Author: Varun Chaubey
 */

document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // 1. DEFAULT DATASET & LOCAL STORAGE MANAGEMENT
    // =========================================================================

    // Real User Reviews Storage (No fake reviews seeded)
    const DEFAULT_REVIEWS = [];

    const BOOK_EXCERPTS = {
        arjun_series: {
            title: "Arjun’s Odyssey",
            badge: "Series Lore • Epic Fantasy Adventure",
            author: "Varun Chaubey",
            series: "Arjun’s Odyssey",
            genre: "Epic Fantasy Adventure",
            readingAge: "11+",
            coverImg: "images/arjun1.png",
            lead: "Five relics. Five universes. One journey. And a secret waiting at the end of it all.",
            excerpt: `Arjun’s Odyssey is an epic fantasy adventure that follows Arjun and his brother Vikram as an unexpected discovery draws them into a world far beyond their own.

What begins as a mysterious journey through Navrang Van soon reveals the existence of five ancient relics, scattered across five different mystical universes. Each relic is connected to a forgotten power, and finding them will take the brothers far beyond the boundaries of the world they know.

Guided at times by a mysterious man who seems to know far more about their journey than he reveals, Arjun and Vikram must face magical forests, ancient temples, mythical creatures, powerful guardians, strange worlds, and challenges that test not only their courage, but their trust in one another.

But there is a reason the relics were scattered.

And as Arjun's journey unfolds, he will discover that the person guiding them may not be the ally he appears to be.

Five relics. Five universes. One journey. And a secret waiting at the end of it all.`,
            primaryActionText: "Inspect Book Stacks",
            primaryActionType: "scroll_stacks",
            targetSlider: "sliderArjun",
            secondaryActionText: "Write Series Review"
        },
        arjun_book1: {
            title: "Arjun’s Odyssey: Mysteries of Navrang Van",
            badge: "Arjun’s Odyssey • Book 1 • Reading Age 11+",
            author: "Varun Chaubey",
            series: "Arjun’s Odyssey",
            bookNum: "Book 1",
            genre: "Fantasy • Adventure • Mystery",
            readingAge: "11+",
            coverImg: "images/arjun1.png",
            lead: "An ancient treasure map, a mysterious locket, and the mythical forest of Navrang Van.",
            excerpt: `Arjun’s Odyssey: Mysteries of Navrang Van follows Arjun Singh and his adventurous elder brother Vikram as they embark on their first great journey after discovering an ancient treasure map and a mysterious locket.

Their search leads them into Navrang Van, a magical forest filled with strange plants, mythical creatures, dangerous challenges, and forgotten secrets. Along the way, they encounter a mysterious man, the serpent Vasuki, the dragon guardians Satyendra and Mithyendra, and other unexpected dangers.

What begins as a search for treasure soon becomes something much bigger, revealing that their adventure is only the beginning of a much greater journey.`,
            primaryActionText: "Read Book (PDF)",
            primaryActionType: "pdf",
            pdfLink: "books/Arjun's Odyssey - Mysteries of Navrang Van.pdf",
            secondaryActionText: "Write Book Review"
        },
        files_series: {
            title: "Files They Buried",
            badge: "Series Lore • Psychological Crime Thriller",
            author: "Varun Chaubey",
            series: "Files They Buried",
            genre: "Psychological Crime Thriller",
            coverImg: "images/files1.png",
            lead: "Every case has a file. Every file has a truth. And some truths were buried for a reason.",
            excerpt: `Files They Buried follows Kabir Verma, a police investigator whose career becomes intertwined with cases that refuse to stay buried.

Each book explores a different case—different victims, different motives, and different truths hidden beneath the official story.

But beneath these individual investigations lies a larger story involving Kabir, his partner Vikram Chauhan, and the cases that continue to connect their past with the present.

Every case has a file.
Every file has a truth.
And some truths were buried for a reason.`,
            primaryActionText: "Access Dossiers",
            primaryActionType: "scroll_stacks",
            targetSlider: "sliderFiles",
            secondaryActionText: "Write Case Review"
        },
        files_book1: {
            title: "Files They Buried: The Case That Stayed",
            badge: "Files They Buried • Case 01 • Crime Thriller",
            author: "Varun Chaubey",
            series: "Files They Buried",
            genre: "Psychological Crime Thriller",
            coverImg: "images/files1.png",
            lead: "Some cases get closed. This one stayed.",
            excerpt: `A psychological crime thriller following Kabir Verma, a young police investigator, and his partner Vikram Chauhan as they investigate a series of deaths initially ruled as suicides.

Three victims.
Identical crime scenes.
A missing fingernail from the same finger.

As Kabir digs deeper, he discovers Dr. Sameer Khanna, a psychologist who has a disturbing connection to the victims. What begins as a routine investigation slowly turns into a psychological battle of manipulation, truth, and guilt.

The case is eventually closed—but not everything about it is resolved.
Some cases get closed. This one stayed.`,
            primaryActionText: "Declassify & Read PDF",
            primaryActionType: "pdf",
            pdfLink: "books/Files They Buried.pdf",
            secondaryActionText: "Write Case Review"
        }
    };

    // Aliases for compatibility
    BOOK_EXCERPTS.arjun = BOOK_EXCERPTS.arjun_series;
    BOOK_EXCERPTS.files = BOOK_EXCERPTS.files_series;

    // Fresh start: Clear old cache and load real user reviews from storage
    function getStoredReviews() {
        try {
            // Clear legacy cache from prior versions
            localStorage.removeItem("arcane_reviews_v1");
            const stored = localStorage.getItem("arcane_reviews_v2");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Could not parse stored reviews", e);
        }
        return [];
    }

    function saveStoredReviews(reviewsList) {
        try {
            localStorage.setItem("arcane_reviews_v2", JSON.stringify(reviewsList));
        } catch (e) {
            console.error("Failed to persist reviews locally", e);
        }
    }

    let reviews = getStoredReviews();
    let currentFilter = "all";
    let currentSort = "highest";

    // Direct Google Cloud Firestore Configuration (Client-side)
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyA7N5zvVH34uleZM0_hbIHkFU0rLmlkzfI",
        authDomain: "nomadic-voltage-k07pf.firebaseapp.com",
        projectId: "nomadic-voltage-k07pf",
        storageBucket: "nomadic-voltage-k07pf.firebasestorage.app",
        messagingSenderId: "303819541823",
        appId: "1:303819541823:web:52694197df5e4cc42d978a"
    };
    const FIRESTORE_DB_ID = "ai-studio-arcane-fc6d21b8-8112-447c-9c40-7c57b852a9b7";

    let clientDb = null;
    let fbModule = null;

    function mergeAndApplyReviews(newReviewsList) {
        if (!Array.isArray(newReviewsList)) return;
        
        const reviewMap = new Map();
        // Add remote reviews from cloud
        newReviewsList.forEach((r) => {
            if (r && r.id) reviewMap.set(r.id, r);
        });
        // Retain any pending locally created reviews until synced to cloud
        reviews.forEach((r) => {
            if (r && r.id && String(r.id).startsWith("rev-") && !reviewMap.has(r.id)) {
                reviewMap.set(r.id, r);
            }
        });

        reviews = Array.from(reviewMap.values());
        reviews.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
        saveStoredReviews(reviews);
        updateScoreboard();
        renderReviews();

        const ledgerPill = document.getElementById("ledgerStatusPill");
        if (ledgerPill) {
            ledgerPill.innerHTML = '<span class="ledger-dot"></span><span>Global Cloud Archive • Active</span>';
        }
    }

    // Sync any reviews that were saved only in localStorage (starts with rev-)
    async function syncPendingLocalReviews() {
        if (!clientDb || !fbModule) return;
        const currentLocal = getStoredReviews();
        const pending = currentLocal.filter((r) => r.id && String(r.id).startsWith("rev-"));
        if (pending.length === 0) return;

        for (const item of pending) {
            try {
                const { id, ...dataToSave } = item;
                const docRef = await fbModule.addDoc(fbModule.collection(clientDb, "reviews"), {
                    ...dataToSave,
                    timestamp: Number(dataToSave.timestamp) || Date.now(),
                    helpfulCount: Number(dataToSave.helpfulCount) || 0,
                    verified: true
                });
                if (docRef && docRef.id) {
                    item.id = docRef.id;
                    console.log("[Firestore Client] Synced local scroll to cloud:", docRef.id);
                }
            } catch (syncErr) {
                console.warn("[Firestore Client] Sync pending failed:", syncErr);
            }
        }
        saveStoredReviews(currentLocal);
    }

    // Direct Google Cloud Firestore initialization via CDN module
    async function initClientFirestore() {
        try {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
            const {
                getFirestore,
                collection,
                getDocs,
                addDoc,
                doc,
                updateDoc,
                increment,
                query,
                orderBy,
                onSnapshot
            } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

            const app = initializeApp(FIREBASE_CONFIG, "arcane-scribe-client");
            clientDb = getFirestore(app, FIRESTORE_DB_ID);
            fbModule = {
                collection,
                getDocs,
                addDoc,
                doc,
                updateDoc,
                increment,
                query,
                orderBy,
                onSnapshot
            };

            console.log("[Firestore Client] Direct cloud link established.");

            // Listen for real-time reviews across all users worldwide
            const reviewsColl = collection(clientDb, "reviews");
            const q = query(reviewsColl, orderBy("timestamp", "desc"));
            onSnapshot(q, (snapshot) => {
                const cloudReviews = [];
                snapshot.forEach((docSnap) => {
                    cloudReviews.push({
                        id: docSnap.id,
                        ...docSnap.data()
                    });
                });
                mergeAndApplyReviews(cloudReviews);
            }, (err) => {
                console.warn("[Firestore Client] onSnapshot fallback to polling:", err);
                fetchReviewsFromDatabase();
            });

            // Immediately sync any locally created reviews to cloud
            await syncPendingLocalReviews();
            return true;
        } catch (err) {
            console.warn("[Firestore Client] Direct connection bypassed, relying on API fallback:", err);
            return false;
        }
    }

    // Fallback: Fetch real reviews from Firestore via /api/reviews
    async function fetchReviewsFromDatabase() {
        const ledgerPill = document.getElementById("ledgerStatusPill");
        try {
            const response = await fetch('/api/reviews', {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });
            const contentType = response.headers.get("content-type");
            if (response.ok && contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    mergeAndApplyReviews(data);
                    return;
                }
            }
        } catch (err) {
            console.warn("[Firestore] Unable to fetch remote reviews via API:", err);
            if (ledgerPill && (!clientDb)) {
                ledgerPill.innerHTML = '<span class="ledger-dot" style="background: #f59e0b; box-shadow: 0 0 6px #f59e0b;"></span><span>Archival Cache Active</span>';
            }
        }
    }

    // Auto-sync with Firestore every 15 seconds and on tab refocus
    setInterval(fetchReviewsFromDatabase, 15000);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            fetchReviewsFromDatabase();
            syncPendingLocalReviews();
        }
    });

    // Track user's upvoted reviews in this session / localStorage
    function getVotedReviewIds() {
        try {
            const stored = localStorage.getItem("arcane_voted_reviews");
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    function saveVotedReviewId(id) {
        try {
            const voted = getVotedReviewIds();
            if (!voted.includes(id)) {
                voted.push(id);
                localStorage.setItem("arcane_voted_reviews", JSON.stringify(voted));
            }
        } catch (e) {
            console.warn("Could not save voted review", e);
        }
    }

    // =========================================================================
    // 2. HERO SECTION TYPING TEXT
    // =========================================================================
    const typingPhrases = [
        "Stories Between Worlds",
        "Ancient Lore & Classified Dossiers",
        "Where Relics Awaken and Mysteries Unravel",
        "Forbidden Chronicles of Navrang Van"
    ];
    const typingElement = document.getElementById("typing-text");
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function handleTyping() {
        if (!typingElement) return;
        const currentPhrase = typingPhrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 45;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 95;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 1800; // Pause at full phrase
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % typingPhrases.length;
            typingSpeed = 400; // Pause before new phrase
        }

        setTimeout(handleTyping, typingSpeed);
    }
    handleTyping();

    // =========================================================================
    // 3. LUMOS / NOX CANDLE TOGGLE & SCROLL FADE
    // =========================================================================
    const lumosBtn = document.getElementById("lumosBtn");
    const candleChamber = document.getElementById("candleChamber");

    function updateCandleScrollFade() {
        if (!candleChamber) return;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        // Fade out candles smoothly as user scrolls down the page
        const fadeDistance = 420;
        const scrollProgress = Math.min(1, Math.max(0, scrollY / fadeDistance));
        const isNox = document.body.classList.contains("nox-mode");
        const baseOpacity = isNox ? 0.15 : 1.0;
        const currentOpacity = Math.max(0, baseOpacity * (1 - scrollProgress));

        candleChamber.style.opacity = currentOpacity.toFixed(3);
        candleChamber.style.transform = `translateY(-${(scrollProgress * 30).toFixed(1)}px)`;

        if (currentOpacity <= 0.01) {
            candleChamber.style.visibility = "hidden";
        } else {
            candleChamber.style.visibility = "visible";
        }
    }

    function setLumosState(isNox) {
        if (isNox) {
            document.body.classList.add("nox-mode");
            if (lumosBtn) {
                lumosBtn.innerHTML = `<span class="lumos-wand">✨</span><span class="lumos-text">Lumos</span>`;
                lumosBtn.setAttribute("title", "Cast Lumos to illuminate the library");
            }
            localStorage.setItem("arcane_candle_mode", "nox");
        } else {
            document.body.classList.remove("nox-mode");
            if (lumosBtn) {
                lumosBtn.innerHTML = `<span class="lumos-wand">🪄</span><span class="lumos-text">Nox</span>`;
                lumosBtn.setAttribute("title", "Cast Nox to dim the library into darkness");
            }
            localStorage.setItem("arcane_candle_mode", "lumos");
        }
        updateCandleScrollFade();
    }

    const savedCandleMode = localStorage.getItem("arcane_candle_mode") || "lumos";
    setLumosState(savedCandleMode === "nox");

    if (lumosBtn) {
        lumosBtn.addEventListener("click", () => {
            const isCurrentlyNox = document.body.classList.contains("nox-mode");
            setLumosState(!isCurrentlyNox);
            showToast(isCurrentlyNox ? "Lumos! Radiant warmth illuminates the library." : "Nox! The Restricted Section dims into shadowy arcane twilight.");
        });
    }

    // =========================================================================
    // 4. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHTING & CANDLE DISAPPEAR
    // =========================================================================
    const navbar = document.getElementById("mainNav");
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section");

    let scrollRafScheduled = false;

    function handleScrollUpdates() {
        const scrollY = window.scrollY || window.pageYOffset || 0;

        // Navbar scrolled state
        if (scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Candles disappear slowly when scrolling down
        updateCandleScrollFade();

        // Active link highlighting
        let currentId = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 140;
            if (scrollY >= sectionTop) {
                currentId = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentId}`) {
                link.classList.add("active");
            }
        });

        scrollRafScheduled = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollRafScheduled) {
            window.requestAnimationFrame(handleScrollUpdates);
            scrollRafScheduled = true;
        }
    }, { passive: true });

    // Initial check on load
    updateCandleScrollFade();

    // =========================================================================
    // 5. BOOK SLIDERS (INSPECT / COLLAPSE & DRAG TO SCROLL)
    // =========================================================================
    const viewButtons = document.querySelectorAll(".view-books-btn");
    viewButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const slider = document.getElementById(targetId);
            if (!slider) return;

            const isShown = slider.classList.contains("show");
            const mobileCtrl = document.querySelector(`.mobile-slider-controls[data-slider="${targetId}"]`);

            if (isShown) {
                slider.classList.remove("show");
                if (mobileCtrl) mobileCtrl.style.display = "none";
                btn.querySelector(".btn-text").textContent = targetId.includes("Arjun") ? "Inspect Stacks" : "Access Dossiers";
                btn.querySelector(".arrow-icon").textContent = "▾";
            } else {
                slider.classList.add("show");
                if (mobileCtrl) mobileCtrl.style.display = "";
                btn.querySelector(".btn-text").textContent = targetId.includes("Arjun") ? "Hide Stacks" : "Hide Dossiers";
                btn.querySelector(".arrow-icon").textContent = "▴";
                if (typeof window.refreshScrollReveal === "function") {
                    window.refreshScrollReveal();
                }
            }
        });
    });

    // Mobile Carousel Navigation Engine
    function initMobileSliders() {
        const mobileControls = document.querySelectorAll(".mobile-slider-controls");
        mobileControls.forEach((ctrl) => {
            const sliderId = ctrl.getAttribute("data-slider");
            const slider = document.getElementById(sliderId);
            if (!slider) return;

            const prevBtn = ctrl.querySelector(".prev-btn");
            const nextBtn = ctrl.querySelector(".next-btn");
            const dots = ctrl.querySelectorAll(".slider-dot");
            const counter = ctrl.querySelector(".slider-counter");
            const cards = slider.querySelectorAll(".mini-book");
            const total = cards.length || 2;
            const isDossier = sliderId.toLowerCase().includes("files");
            const term = isDossier ? "Case" : "Tome";

            function updateState() {
                const scrollLeft = slider.scrollLeft;
                const width = slider.clientWidth || 1;
                const activeIndex = Math.min(total - 1, Math.max(0, Math.round(scrollLeft / width)));

                dots.forEach((dot, idx) => {
                    dot.classList.toggle("active", idx === activeIndex);
                });

                if (counter) {
                    counter.textContent = `${term} ${activeIndex + 1} of ${total}`;
                }

                if (prevBtn) prevBtn.disabled = activeIndex <= 0;
                if (nextBtn) nextBtn.disabled = activeIndex >= total - 1;
            }

            if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                    const step = slider.clientWidth || 300;
                    slider.scrollBy({ left: -step, behavior: "smooth" });
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    const step = slider.clientWidth || 300;
                    slider.scrollBy({ left: step, behavior: "smooth" });
                });
            }

            dots.forEach((dot) => {
                dot.addEventListener("click", () => {
                    const targetIdx = parseInt(dot.getAttribute("data-index"), 10) || 0;
                    const step = slider.clientWidth || 300;
                    slider.scrollTo({ left: targetIdx * step, behavior: "smooth" });
                });
            });

            let scrollTimeout;
            slider.addEventListener("scroll", () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateState, 50);
            }, { passive: true });

            updateState();
        });
    }

    initMobileSliders();

    const sliders = document.querySelectorAll(".books-slider");
    sliders.forEach((slider) => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener("mousedown", (e) => {
            isDown = true;
            slider.style.cursor = "var(--cursor-wand-pointer)";
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener("mouseleave", () => {
            isDown = false;
            slider.style.cursor = "var(--cursor-wand-default)";
        });

        slider.addEventListener("mouseup", () => {
            isDown = false;
            slider.style.cursor = "var(--cursor-wand-default)";
        });

        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.8;
            slider.scrollLeft = scrollLeft - walk;
        });
    });

    // =========================================================================
    // 6. REVIEWS SCOREBOARD & CALCULATION ENGINE
    // =========================================================================
    const totalReviewsCountEl = document.getElementById("totalReviewsCount");
    const countAllEl = document.getElementById("countAll");
    const countArjunEl = document.getElementById("countArjun");
    const countFilesEl = document.getElementById("countFiles");

    function updateScoreboard() {
        const total = reviews.length;
        const scoreLargeEl = document.querySelector(".score-large");
        const scoreStarsEl = document.getElementById("scoreStars");
        const rows = document.querySelectorAll(".rating-bar-row");
        const seriesCountArjun = document.getElementById("seriesCountArjun");
        const seriesCountFiles = document.getElementById("seriesCountFiles");
        const seriesRatingArjun = document.getElementById("seriesRatingArjun");
        const seriesRatingFiles = document.getElementById("seriesRatingFiles");

        const arjunReviews = reviews.filter((r) => r.bookCategory === "arjun");
        const filesReviews = reviews.filter((r) => r.bookCategory === "files");

        const arjunCount = arjunReviews.length;
        const filesCount = filesReviews.length;

        if (countAllEl) countAllEl.textContent = total;
        if (countArjunEl) countArjunEl.textContent = arjunCount;
        if (countFilesEl) countFilesEl.textContent = filesCount;

        if (seriesCountArjun) seriesCountArjun.textContent = `(${arjunCount} Scroll${arjunCount === 1 ? "" : "s"})`;
        if (seriesCountFiles) seriesCountFiles.textContent = `(${filesCount} Scroll${filesCount === 1 ? "" : "s"})`;

        if (arjunCount > 0 && seriesRatingArjun) {
            const avgA = (arjunReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / arjunCount).toFixed(1);
            seriesRatingArjun.textContent = avgA;
        } else if (seriesRatingArjun) {
            seriesRatingArjun.textContent = "—";
        }

        if (filesCount > 0 && seriesRatingFiles) {
            const avgF = (filesReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / filesCount).toFixed(1);
            seriesRatingFiles.textContent = avgF;
        } else if (seriesRatingFiles) {
            seriesRatingFiles.textContent = "—";
        }

        if (total === 0) {
            if (scoreLargeEl) scoreLargeEl.textContent = "—";
            if (totalReviewsCountEl) {
                totalReviewsCountEl.textContent = "No reviews yet • Be the first reviewer";
            }
            if (rows.length >= 3) {
                rows.forEach((row) => {
                    const fill = row.querySelector(".bar-fill");
                    const pct = row.querySelector(".bar-pct");
                    if (fill) fill.style.width = "0%";
                    if (pct) pct.textContent = "0%";
                });
            }
            return;
        }

        const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
        const avg = (sum / total).toFixed(1);

        if (scoreLargeEl) scoreLargeEl.textContent = avg;
        if (scoreStarsEl) scoreStarsEl.textContent = renderStars(Math.round(Number(avg)));

        if (totalReviewsCountEl) {
            totalReviewsCountEl.textContent = `Based on ${total} Review${total > 1 ? "s" : ""}`;
        }

        // Ratings breakdown
        const count5 = reviews.filter((r) => Number(r.rating) === 5).length;
        const count4 = reviews.filter((r) => Number(r.rating) === 4).length;
        const count3 = reviews.filter((r) => Number(r.rating) <= 3).length;

        const pct5 = Math.round((count5 / total) * 100);
        const pct4 = Math.round((count4 / total) * 100);
        const pct3 = Math.round((count3 / total) * 100);

        if (rows.length >= 3) {
            rows[0].querySelector(".bar-fill").style.width = `${pct5}%`;
            rows[0].querySelector(".bar-pct").textContent = `${pct5}%`;

            rows[1].querySelector(".bar-fill").style.width = `${pct4}%`;
            rows[1].querySelector(".bar-pct").textContent = `${pct4}%`;

            rows[2].querySelector(".bar-fill").style.width = `${pct3}%`;
            rows[2].querySelector(".bar-pct").textContent = `${pct3}%`;
        }
    }

    // =========================================================================
    // 7. RENDER REVIEWS GRID
    // =========================================================================
    const reviewsGrid = document.getElementById("reviewsGrid");

    function renderStars(rating) {
        const r = Math.min(Math.max(Number(rating) || 5, 1), 5);
        return "★".repeat(r) + "☆".repeat(5 - r);
    }

    function escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderReviews() {
        if (!reviewsGrid) return;

        let filtered = reviews.filter((rev) => {
            if (currentFilter === "all") return true;
            return rev.bookCategory === currentFilter;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (currentSort === "highest") {
                return (b.rating || 5) - (a.rating || 5) || (b.timestamp || 0) - (a.timestamp || 0);
            }
            if (currentSort === "newest") {
                return (b.timestamp || 0) - (a.timestamp || 0);
            }
            if (currentSort === "helpful") {
                return (b.helpfulCount || 0) - (a.helpfulCount || 0);
            }
            return 0;
        });

        if (filtered.length === 0) {
            reviewsGrid.innerHTML = `
                <div class="no-reviews-parchment" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; border: 1px dashed var(--border-gold); border-radius: 12px; background: rgba(26,17,10,0.5);">
                    <p style="font-family: var(--font-heading); font-size: 20px; color: var(--gold-light); margin-bottom: 8px;">No reviews yet under this archive category</p>
                    <p style="color: var(--text-subtle); margin-bottom: 20px;">Be the first reader to share your thoughts for this volume.</p>
                    <button class="magical-btn primary-btn" id="emptyInscribeBtn">
                        <span class="btn-feather">🪶</span> Write the First Review
                    </button>
                </div>
            `;
            const emptyBtn = document.getElementById("emptyInscribeBtn");
            if (emptyBtn) {
                emptyBtn.addEventListener("click", () => openReviewModal());
            }
            return;
        }

        const votedIds = getVotedReviewIds();

        reviewsGrid.innerHTML = filtered
            .map((rev) => {
                const initial = rev.reviewerName ? rev.reviewerName.trim().charAt(0).toUpperCase() : "S";
                const isVoted = votedIds.includes(rev.id);
                const avatarClass = rev.avatarColor === "blue" ? "avatar-blue" : rev.avatarColor === "green" ? "avatar-green" : "";

                return `
                    <article class="review-scroll-card" data-id="${escapeHtml(rev.id)}" id="review-${escapeHtml(rev.id)}">
                        <div class="review-card-header">
                            <div class="reviewer-meta">
                                <div class="reviewer-avatar-stamp ${avatarClass}">${initial}</div>
                                <div class="reviewer-info-wrap">
                                    <span class="reviewer-name">${escapeHtml(rev.reviewerName)}</span>
                                    <span class="reviewer-affiliation">${escapeHtml(rev.reviewerAffiliation || "Archive Reader")}</span>
                                </div>
                            </div>
                            <time class="review-date">${escapeHtml(rev.date || "Archive Era")}</time>
                        </div>

                        <div class="review-stars-row">
                            <span class="card-stars">${renderStars(rev.rating)}</span>
                            <span class="book-tag-pill" title="${escapeHtml(rev.bookTitle)}">${escapeHtml(rev.bookTitle)}</span>
                        </div>

                        <h4 class="review-title">${escapeHtml(rev.title)}</h4>
                        <p class="review-body">${escapeHtml(rev.content)}</p>

                        <div class="review-card-footer">
                            <div class="scroll-verified-badge">
                                <span>📜</span>
                                <span>Verified Reader Scroll</span>
                            </div>
                            <button class="helpful-btn ${isVoted ? "voted" : ""}" data-id="${escapeHtml(rev.id)}" title="Mark as Enlightening Scroll">
                                <span>✨</span>
                                <span class="helpful-label">${isVoted ? "Enlightened" : "Enlightening"}</span>
                                <span class="helpful-num">(${Number(rev.helpfulCount || 0)})</span>
                            </button>
                        </div>
                    </article>
                `;
            })
            .join("");

        // Attach helpful upvote listeners
        document.querySelectorAll(".helpful-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const reviewId = btn.getAttribute("data-id");
                handleHelpfulClick(reviewId, btn);
            });
        });

        // Trigger on-scroll reveal for newly rendered reviews
        if (typeof window.refreshScrollReveal === "function") {
            window.refreshScrollReveal();
        }
    }

    function handleHelpfulClick(reviewId, buttonElement) {
        const voted = getVotedReviewIds();
        if (voted.includes(reviewId)) {
            showToast("You have already consecrated this scroll as enlightening!");
            return;
        }

        const review = reviews.find((r) => r.id === reviewId);
        if (review) {
            review.helpfulCount = (Number(review.helpfulCount) || 0) + 1;
            saveStoredReviews(reviews);
            saveVotedReviewId(reviewId);

            buttonElement.classList.add("voted");
            const labelEl = buttonElement.querySelector(".helpful-label");
            const numEl = buttonElement.querySelector(".helpful-num");
            if (labelEl) labelEl.textContent = "Enlightened";
            if (numEl) numEl.textContent = `(${review.helpfulCount})`;

            showToast("✦ Scroll marked as enlightening in the ledger!");

            // 1. Direct Cloud Firestore increment if connected
            if (clientDb && fbModule && !reviewId.startsWith("rev-")) {
                try {
                    const reviewRef = fbModule.doc(clientDb, "reviews", reviewId);
                    fbModule.updateDoc(reviewRef, {
                        helpfulCount: fbModule.increment(1)
                    }).catch((err) => {
                        console.warn("[Firestore Client] Direct increment failed:", err);
                    });
                } catch (e) {
                    console.warn("[Firestore Client] Error updating doc:", e);
                }
            }

            // 2. Sync with Firestore database server API
            fetch(`/api/reviews/${encodeURIComponent(reviewId)}/helpful`, {
                method: "POST"
            }).catch((err) => {
                console.warn("[Firestore] Could not sync endorsement to server:", err);
            });
        }
    }

    // =========================================================================
    // 8. FILTER PILLS & SORT DROPDOWN
    // =========================================================================
    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            filterPills.forEach((p) => {
                p.classList.remove("active");
                p.setAttribute("aria-selected", "false");
            });
            pill.classList.add("active");
            pill.setAttribute("aria-selected", "true");

            currentFilter = pill.getAttribute("data-filter") || "all";
            renderReviews();
        });
    });

    const sortSelect = document.getElementById("sortReviewsSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderReviews();
        });
    }

    // Direct series review links (e.g. from series cards)
    document.querySelectorAll(".review-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            const filterName = link.getAttribute("data-filter");
            if (filterName) {
                const targetKey = filterName.toLowerCase().includes("arjun") ? "arjun" : "files";
                currentFilter = targetKey;
                filterPills.forEach((p) => {
                    const isTarget = p.getAttribute("data-filter") === targetKey;
                    p.classList.toggle("active", isTarget);
                    p.setAttribute("aria-selected", isTarget ? "true" : "false");
                });
                renderReviews();
            }
        });
    });

    // =========================================================================
    // 9. MODAL: INSCRIBE REVIEW SCROLL
    // =========================================================================
    const reviewModal = document.getElementById("reviewModal");
    const openReviewModalBtn = document.getElementById("openReviewModalBtn");
    const closeReviewModalBtn = document.getElementById("closeReviewModalBtn");
    const cancelReviewBtn = document.getElementById("cancelReviewBtn");
    const reviewForm = document.getElementById("reviewForm");
    const reviewBookSelect = document.getElementById("reviewBookSelect");
    const starPicker = document.getElementById("starPicker");
    const ratingValueInput = document.getElementById("ratingValueInput");
    const ratingDesc = document.getElementById("ratingDesc");

    const RATING_DESCRIPTIONS = {
        1: "1 Star • Needs Enchantment",
        2: "2 Stars • Fair Effort",
        3: "3 Stars • Intriguing Lore",
        4: "4 Stars • Riveting & Spellbinding",
        5: "5 Stars • Exemplary Masterpiece"
    };

    function openReviewModal(preferredBookTitle = null) {
        if (!reviewModal) return;
        if (reviewBookSelect) {
            if (preferredBookTitle) {
                for (let i = 0; i < reviewBookSelect.options.length; i++) {
                    if (reviewBookSelect.options[i].value.toLowerCase().includes(preferredBookTitle.toLowerCase())) {
                        reviewBookSelect.selectedIndex = i;
                        break;
                    }
                }
            } else {
                reviewBookSelect.selectedIndex = 0;
            }
        }
        reviewModal.removeAttribute("hidden");
        document.body.style.overflow = "hidden";
        const firstInput = reviewForm.querySelector("input, select");
        if (firstInput) firstInput.focus();
    }

    function closeReviewModal() {
        if (!reviewModal) return;
        reviewModal.setAttribute("hidden", "");
        document.body.style.overflow = "";
    }

    if (openReviewModalBtn) {
        openReviewModalBtn.addEventListener("click", () => openReviewModal());
    }

    if (closeReviewModalBtn) {
        closeReviewModalBtn.addEventListener("click", closeReviewModal);
    }

    if (cancelReviewBtn) {
        cancelReviewBtn.addEventListener("click", closeReviewModal);
    }

    // Modal background click closes modal
    if (reviewModal) {
        reviewModal.addEventListener("click", (e) => {
            if (e.target === reviewModal) {
                closeReviewModal();
            }
        });
    }

    // Per-book review buttons in library cards
    document.querySelectorAll(".book-review-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const bookTitle = btn.getAttribute("data-book-title") || "";
            openReviewModal(bookTitle);
        });
    });

    // Star rating picker
    if (starPicker) {
        const starButtons = starPicker.querySelectorAll(".star-pick-btn");

        function updateStars(rating) {
            ratingValueInput.value = rating;
            starButtons.forEach((b) => {
                const bVal = Number(b.getAttribute("data-rating"));
                b.classList.toggle("active", bVal <= rating);
            });
            if (ratingDesc) {
                ratingDesc.textContent = RATING_DESCRIPTIONS[rating] || `${rating} Stars`;
            }
        }

        starButtons.forEach((btn) => {
            btn.addEventListener("mouseenter", () => {
                const hoverVal = Number(btn.getAttribute("data-rating"));
                starButtons.forEach((b) => {
                    const bVal = Number(b.getAttribute("data-rating"));
                    b.classList.toggle("active", bVal <= hoverVal);
                });
            });

            btn.addEventListener("click", () => {
                const val = Number(btn.getAttribute("data-rating"));
                updateStars(val);
            });
        });

        starPicker.addEventListener("mouseleave", () => {
            const currentVal = Number(ratingValueInput.value) || 5;
            updateStars(currentVal);
        });
    }

    // Review Form Submission
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const selectedBook = reviewBookSelect.value;
            const reviewerName = document.getElementById("reviewerNameInput").value.trim();
            const reviewerHouse = document.getElementById("reviewerHouseInput").value.trim() || "Archive Scholar";
            const reviewTitle = document.getElementById("reviewTitleInput").value.trim();
            const reviewContent = document.getElementById("reviewContentInput").value.trim();
            const rating = Number(ratingValueInput.value) || 5;

            if (!reviewerName || !reviewTitle || !reviewContent) {
                showToast("Please complete all required fields before sealing the scroll.");
                return;
            }

            const submitBtn = reviewForm.querySelector(".submit-scroll-btn");
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="btn-wax">⚜</span> Inscribing Scroll...`;
            }

            // Derive category
            let bookCat = "all";
            if (selectedBook.toLowerCase().includes("arjun")) {
                bookCat = "arjun";
            } else if (selectedBook.toLowerCase().includes("files")) {
                bookCat = "files";
            }

            // Pick random avatar seal color
            const colors = ["crimson", "blue", "green"];
            const avatarColor = colors[Math.floor(Math.random() * colors.length)];

            const today = new Date();
            const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

            let newReview = {
                id: "rev-" + Date.now(),
                bookCategory: bookCat,
                bookTitle: selectedBook,
                reviewerName: reviewerName,
                reviewerAffiliation: reviewerHouse,
                avatarColor: avatarColor,
                rating: rating,
                date: dateStr,
                timestamp: Date.now(),
                title: reviewTitle,
                content: reviewContent,
                helpfulCount: 0,
                verified: true
            };

            // Save to Firestore Cloud (direct write + server API fallback)
            let savedToCloud = false;

            // 1. Direct Cloud Firestore write
            if (clientDb && fbModule) {
                try {
                    const docRef = await fbModule.addDoc(fbModule.collection(clientDb, "reviews"), {
                        bookCategory: bookCat,
                        bookTitle: selectedBook,
                        reviewerName: reviewerName,
                        reviewerAffiliation: reviewerHouse,
                        avatarColor: avatarColor,
                        rating: rating,
                        date: dateStr,
                        timestamp: Date.now(),
                        title: reviewTitle,
                        content: reviewContent,
                        helpfulCount: 0,
                        verified: true
                    });
                    if (docRef && docRef.id) {
                        newReview.id = docRef.id;
                        savedToCloud = true;
                        console.log("[Firestore Client] Direct scroll inscribed with ID:", docRef.id);
                    }
                } catch (directErr) {
                    console.warn("[Firestore Client] Direct write error, trying server API:", directErr);
                }
            }

            // 2. Server API fallback if direct write did not succeed
            if (!savedToCloud) {
                try {
                    const res = await fetch("/api/reviews", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            bookTitle: selectedBook,
                            reviewerName,
                            reviewerAffiliation: reviewerHouse,
                            rating,
                            title: reviewTitle,
                            content: reviewContent,
                            avatarColor
                        })
                    });

                    const contentType = res.headers.get("content-type");
                    if (res.ok && contentType && contentType.includes("application/json")) {
                        const savedData = await res.json();
                        if (savedData && savedData.id) {
                            newReview = savedData;
                            savedToCloud = true;
                        }
                    }
                } catch (err) {
                    console.warn("[Firestore] Failed to persist to server, keeping local scroll:", err);
                }
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }

            if (!reviews.some((r) => r.id === newReview.id)) {
                reviews.unshift(newReview);
            }
            saveStoredReviews(reviews);

            updateScoreboard();
            renderReviews();
            fetchReviewsFromDatabase();

            reviewForm.reset();
            if (ratingValueInput) ratingValueInput.value = "5";
            if (starPicker) {
                starPicker.querySelectorAll(".star-pick-btn").forEach((b) => b.classList.add("active"));
                if (ratingDesc) ratingDesc.textContent = RATING_DESCRIPTIONS[5];
            }

            closeReviewModal();
            showToast("⚜ Your scroll has been inscribed in the Restricted Section!");

            // Scroll smoothly to reviews section and highlight new card
            const reviewsSection = document.getElementById("reviews");
            if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                    const newCard = document.getElementById(`review-${newReview.id}`);
                    if (newCard) {
                        newCard.style.outline = "2px solid var(--gold-bright)";
                        newCard.style.boxShadow = "0 0 30px var(--gold-glow)";
                        setTimeout(() => {
                            newCard.style.transition = "outline 1s ease, box-shadow 1s ease";
                            newCard.style.outline = "none";
                            newCard.style.boxShadow = "";
                        }, 2500);
                    }
                }, 600);
            }
        });
    }

    // =========================================================================
    // 10. MODAL: BOOK EXCERPT & LORE PREVIEW
    // =========================================================================
    const bookModal = document.getElementById("bookModal");
    const closeBookModalBtn = document.getElementById("closeBookModalBtn");
    const bookModalContent = document.getElementById("bookModalContent");

    function openBookExcerptModal(bookKey) {
        if (!bookModal || !bookModalContent) return;
        const data = BOOK_EXCERPTS[bookKey];
        if (!data) return;

        bookModalContent.innerHTML = `
            <div class="excerpt-header">
                <img src="${data.coverImg}" alt="${escapeHtml(data.title)}" class="excerpt-cover" onerror="this.src='images/logo.png'">
                <div class="excerpt-header-info">
                    <span class="excerpt-badge">${escapeHtml(data.badge)}</span>
                    <h3 id="bookModalTitle">${escapeHtml(data.title)}</h3>
                    <div class="excerpt-meta-tags">
                        <span class="meta-tag">Author: ${escapeHtml(data.author || "Varun Chaubey")}</span>
                        ${data.genre ? `<span class="meta-tag">Genre: ${escapeHtml(data.genre)}</span>` : ""}
                        ${data.readingAge ? `<span class="meta-tag">Reading Age: ${escapeHtml(data.readingAge)}</span>` : ""}
                    </div>
                </div>
            </div>

            <p style="font-family: var(--font-heading); font-size: 15px; color: var(--gold-light); margin-top: 5px;">
                ${escapeHtml(data.lead)}
            </p>

            <div class="excerpt-text">
                ${data.excerpt.split("\n\n").map((p) => `<p style="margin-bottom: 12px; line-height: 1.6;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}
            </div>

            <div class="excerpt-actions">
                ${
                    data.primaryActionType === "pdf"
                        ? `<a href="${data.pdfLink}" target="_blank" rel="noopener" class="magical-btn primary-btn">
                            <span>📄</span> Declassify & Read PDF
                           </a>`
                        : data.primaryActionType === "scroll_stacks"
                        ? `<button class="magical-btn primary-btn" id="excerptReadAction">
                            <span>📚</span> ${escapeHtml(data.primaryActionText || "Inspect Stacks")}
                           </button>`
                        : `<button class="magical-btn primary-btn" id="excerptReadAction">
                            <span>📜</span> ${escapeHtml(data.primaryActionText || "Read Complete Lore")}
                           </button>`
                }
                <button class="book-review-btn" id="excerptReviewAction" style="padding: 12px 18px; font-size: 13px;">
                    <span>🪶</span> ${escapeHtml(data.secondaryActionText || "Inscribe Review")}
                </button>
            </div>
        `;

        bookModal.removeAttribute("hidden");
        document.body.style.overflow = "hidden";

        const excerptReviewAction = document.getElementById("excerptReviewAction");
        if (excerptReviewAction) {
            excerptReviewAction.addEventListener("click", () => {
                closeBookExcerptModal();
                openReviewModal(data.title);
            });
        }

        const excerptReadAction = document.getElementById("excerptReadAction");
        if (excerptReadAction) {
            excerptReadAction.addEventListener("click", () => {
                if (data.primaryActionType === "scroll_stacks" && data.targetSlider) {
                    closeBookExcerptModal();
                    const slider = document.getElementById(data.targetSlider);
                    if (slider) {
                        slider.classList.add("show");
                        slider.scrollIntoView({ behavior: "smooth", block: "center" });
                        showToast(`⚜ Unfolding the archives of ${data.title}!`);
                    }
                } else {
                    showToast("Full grimoire edition is undergoing final enchanted binding!");
                }
            });
        }
    }

    function closeBookExcerptModal() {
        if (!bookModal) return;
        bookModal.setAttribute("hidden", "");
        document.body.style.overflow = "";
    }

    if (closeBookModalBtn) {
        closeBookModalBtn.addEventListener("click", closeBookExcerptModal);
    }

    if (bookModal) {
        bookModal.addEventListener("click", (e) => {
            if (e.target === bookModal) {
                closeBookExcerptModal();
            }
        });
    }

    // Attach book preview buttons
    document.querySelectorAll(".preview-tome-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const bookKey = btn.getAttribute("data-book");
            openBookExcerptModal(bookKey);
        });
    });

    document.querySelectorAll(".read-book-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const bookId = btn.getAttribute("data-book-id");
            openBookExcerptModal(bookId || "arjun");
        });
    });

    // Allow clicking book cover wraps to open full details/lore modal
    document.querySelectorAll(".tome-card .book-cover-wrap").forEach((wrap) => {
        wrap.addEventListener("click", () => {
            const card = wrap.closest(".tome-card");
            if (card && card.closest("#sliderArjun")) {
                openBookExcerptModal("arjun_book1");
            } else if (card && card.closest("#sliderFiles")) {
                openBookExcerptModal("files_book1");
            }
        });
    });

    document.querySelectorAll(".read-pdf-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (window.ArcaneAudio && typeof window.ArcaneAudio.playParchment === "function") {
                window.ArcaneAudio.playParchment();
            } else if (window.ArcaneAudio && typeof window.ArcaneAudio.playScroll === "function") {
                window.ArcaneAudio.playScroll();
            }
        });
    });

    // =========================================================================
    // 11. KEYBOARD NAVIGATION (ESCAPE TO CLOSE MODALS)
    // =========================================================================
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (reviewModal && !reviewModal.hasAttribute("hidden")) {
                closeReviewModal();
            }
            if (bookModal && !bookModal.hasAttribute("hidden")) {
                closeBookExcerptModal();
            }
        }
    });

    // =========================================================================
    // 12. TOAST NOTIFICATIONS (MAGICAL ENCHANTMENT)
    // =========================================================================
    const toast = document.getElementById("magicalToast");
    const toastMsg = document.getElementById("toastMessage");
    let toastTimeout;

    function showToast(message) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3600);
    }
    window.showToast = showToast;

    // =========================================================================
    // 13. MAGICAL ON-SCROLL FADE-IN & REVEAL SYSTEM
    // =========================================================================
    function initScrollReveal() {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            // Immediate display fallback for reduced motion or legacy browsers
            document.querySelectorAll(
                ".series-card, .mini-book, .reviews-scoreboard, .review-filter-bar, .review-scroll-card"
            ).forEach((el) => {
                el.classList.add("revealed");
            });
            return;
        }

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        target.classList.add("revealed");
                        target.classList.add("reveal-aura");
                        observer.unobserve(target);
                    }
                });
            },
            {
                root: null,
                threshold: 0.08,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        function registerScrollElements() {
            // Observe book cards, series containers, and review elements
            const targets = document.querySelectorAll(
                ".series-card:not(.revealed), .mini-book:not(.revealed), .reviews-scoreboard:not(.revealed), .review-filter-bar:not(.revealed), .review-scroll-card:not(.revealed)"
            );

            targets.forEach((el) => {
                if (!el.classList.contains("scroll-reveal")) {
                    el.classList.add("scroll-reveal");
                }

                // Stagger cascade for multiple cards in grid or slider
                if (el.classList.contains("mini-book") || el.classList.contains("review-scroll-card")) {
                    const parent = el.parentElement;
                    if (parent) {
                        const siblings = Array.from(parent.children).filter((c) =>
                            c.classList.contains("mini-book") || c.classList.contains("review-scroll-card")
                        );
                        const idx = siblings.indexOf(el);
                        if (idx >= 0) {
                            const delay = ((idx % 4) * 0.12).toFixed(2);
                            el.style.transitionDelay = `${delay}s`;
                        }
                    }
                }

                revealObserver.observe(el);
            });
        }

        window.refreshScrollReveal = registerScrollElements;
        registerScrollElements();
    }

    // ==========================================================================
    // ENCHANTED WAND STARDUST TRAIL
    // ==========================================================================
    function initWandSparkles() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!window.matchMedia("(pointer: fine)").matches) return;

        let lastSparkleTime = 0;
        const sparkColors = ["#ffd700", "#fff5b8", "#ffffff", "#e6c229", "#d4af37"];

        function spawnSpark(x, y, isClick = false) {
            const count = isClick ? 5 : 1;
            for (let i = 0; i < count; i++) {
                const sparkle = document.createElement("div");
                sparkle.className = "wand-stardust";
                const size = isClick ? (Math.random() * 3.5 + 2.5) : (Math.random() * 2.5 + 1.8);
                const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];

                // Offset around wand hotspot (at x, y)
                const offsetX = (Math.random() - 0.5) * (isClick ? 14 : 4);
                const offsetY = (Math.random() - 0.5) * (isClick ? 14 : 4);

                sparkle.style.left = `${x + offsetX}px`;
                sparkle.style.top = `${y + offsetY}px`;
                sparkle.style.width = `${size}px`;
                sparkle.style.height = `${size}px`;
                sparkle.style.backgroundColor = color;
                sparkle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

                document.body.appendChild(sparkle);

                const anim = sparkle.animate([
                    { opacity: 0.9, transform: "scale(1) translate(0, 0)" },
                    { opacity: 0, transform: `scale(0.2) translate(${(Math.random() - 0.5) * 12}px, ${Math.random() * 12 + 6}px)` }
                ], {
                    duration: isClick ? 500 : 380,
                    easing: "ease-out"
                });

                anim.onfinish = () => sparkle.remove();
            }
        }

        window.addEventListener("mousemove", (e) => {
            const now = performance.now();
            if (now - lastSparkleTime > 50) { // ~20 fps throttle
                spawnSpark(e.clientX, e.clientY);
                lastSparkleTime = now;
            }
        }, { passive: true });

        window.addEventListener("click", (e) => {
            spawnSpark(e.clientX, e.clientY, true);
        }, { passive: true });
    }

    // Initial render and live fetch from Firestore Database
    initWandSparkles();
    initScrollReveal();
    updateScoreboard();
    renderReviews();
    fetchReviewsFromDatabase();
    initClientFirestore();
});
